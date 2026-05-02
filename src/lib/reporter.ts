import { config } from "@/config";
import { logger } from "@/logger";
import { IncomingWebhook } from "@slack/webhook";

export type RichInfoField = {
  label: string;
  value: string;
};

export type Reporter = {
  info: (message: string) => Promise<object>;
  error: (message: string) => Promise<object>;
  richInfo: (params: { title: string; fields: RichInfoField[] }) => Promise<object>;
};

function createWinstonReporter() {
  return {
    info: (message: string) => {
      logger.info(message);
      return Promise.resolve({});
    },
    error: (message: string) => {
      logger.error(message);
      return Promise.resolve({});
    },
    richInfo: (params: { title: string; fields: RichInfoField[] }) => {
      const fieldsStr = params.fields.map(f => `${f.label}: ${f.value}`).join(', ');
      logger.info(`${params.title} - ${fieldsStr}`);
      return Promise.resolve({});
    },
  };
}

function createReporter(): Reporter {
  const winstonReporter = createWinstonReporter();
  
  if (config.slackWebhookUrl) {
    const webhook = new IncomingWebhook(config.slackWebhookUrl);
    return {
      info: async (message: string) => {
        await winstonReporter.info(message);
        return webhook.send({
          text: `Info: ${message}`,
        });
      },
      error: async (message: string) => {
        await winstonReporter.error(message);
        return webhook.send({
          text: `Error: ${message}`,
        });
      },
      richInfo: async (params: { title: string; fields: RichInfoField[] }) => {
        await winstonReporter.richInfo(params);
        return webhook.send({
          text: params.title,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: params.title
              }
            },
            {
              type: "section",
              fields: params.fields.map(field => ({
                type: "plain_text" as const,
                text: `${field.label}:\n${field.value}`
              }))
            }
          ]
        });
      },
    };
  }

  if (process.env.NODE_ENV === "production") {
    logger.info("No Slack reporting will be done, webhook URL is not configured.");
  }
  return winstonReporter;
}

export const reporter = createReporter();
