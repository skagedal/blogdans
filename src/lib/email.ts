import { Resend } from "resend";
import { config } from "@/config";
import { logger } from "@/logger";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let resendClient: Resend | undefined;
function getResend(): Resend | undefined {
  if (!config.resendApiKey) return undefined;
  resendClient ??= new Resend(config.resendApiKey);
  return resendClient;
}

/**
 * Send a transactional email via Resend. In environments without
 * RESEND_API_KEY (i.e. local dev) the email is logged instead, so the rest
 * of the flow can still be exercised end-to-end.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
  const resend = getResend();
  if (!resend) {
    logger.info("RESEND_API_KEY not set; would have sent email", { to, subject, text });
    return;
  }
  const { error } = await resend.emails.send({
    from: config.resendFromEmail,
    to: [to],
    subject,
    html,
    text,
  });
  if (error) {
    logger.error("Resend send failed", { to, subject, error });
    throw new Error("Failed to send email");
  }
}
