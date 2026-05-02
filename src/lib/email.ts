import nodemailer, { type Transporter } from "nodemailer";
import { config } from "@/config";
import { logger } from "@/logger";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let transporter: Transporter | undefined;
function getTransporter(): Transporter | undefined {
  if (!config.smtp) return undefined;
  transporter ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465, // STARTTLS on 587, implicit TLS on 465
    auth: { user: config.smtp.user, pass: config.smtp.password },
  });
  return transporter;
}

/**
 * Send a transactional email via SMTP. In environments without an SMTP
 * config (i.e. local dev) the email is logged instead, so the rest of the
 * flow can still be exercised end-to-end.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailArgs): Promise<void> {
  const t = getTransporter();
  if (!t || !config.smtp) {
    logger.info("SMTP not configured; would have sent email", { to, subject, text });
    return;
  }
  try {
    await t.sendMail({ from: config.smtp.from, to, subject, html, text });
    logger.info("Sent email", { to, subject });
  } catch (error) {
    logger.error("SMTP send failed", { to, subject, error });
    throw new Error("Failed to send email");
  }
}
