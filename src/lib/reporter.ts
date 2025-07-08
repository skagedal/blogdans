import { config } from "@/config";
import { logger } from "@/logger";
import { IncomingWebhook } from "@slack/webhook";

export type Reporter = {
  error: (message: string) => Promise<object>;
};

function createWinstonReporter() {
  return {
    error: (message: string) => {
      logger.error(message);
      return Promise.resolve({});
    },
  };
}

function createReporter(): Reporter {
  const winstonReporter = createWinstonReporter();
  
  if (config.slackWebhookUrl) {
    const webhook = new IncomingWebhook(config.slackWebhookUrl);
    return {
      error: async (message: string) => {
        await winstonReporter.error(message);
        return webhook.send({
          text: `Error: ${message}`,
        });
      },
    };
  }

  logger.warn("Slack webhook URL is not configured");
  return winstonReporter;
}

export const reporter = createReporter();
