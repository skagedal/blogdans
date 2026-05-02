import { env } from "node:process";
import { readFileSync } from "node:fs";
import { logger } from "./logger";
import z from "zod";

const featureVersion = z.enum(["next", "current"]);

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

type Config = {
  databaseUrl: string;
  slackWebhookUrl?: string;
  smtp?: SmtpConfig;
  featureVersion: z.infer<typeof featureVersion> | undefined;
  showDrafts: boolean;
};

/**
 * Secrets are read either from environment variables or from files whose paths
 * are specified in environment variables with a _FILE suffix.
 *
 * It is the caller's responsibility to log appropriate messages if secrets are missing.
 */
function readSecretIfAvailable(name: string): string | undefined {
  if (env[name]) {
    return env[name].trim();
  }
  const filePath = env[`${name}_FILE`];
  if (!filePath) {
    return undefined;
  }
  try {
    return readFileSync(filePath, "utf8").trim();
  } catch (error) {
    logger.error(`Failed to read secret ${name}: ${error}`);
  }
  return env[name];
}

function environmentDatabaseUrl() {
  // This detects running under vitest; yes, it's a bit of a hack
  if (typeof globalThis !== 'undefined' && 'describe' in globalThis) {
    return '';
  }
  
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  const password = readSecretIfAvailable("DATABASE_PASSWORD");
  if (!password) {
    throw new Error("Database password must be configured");
  }
  const user = process.env.DATABASE_USER as string;
  const host = process.env.DATABASE_HOST as string;
  const database = process.env.DATABASE_NAME as string;
  const sslmode = process.env.DATABASE_SSLMODE || "disable";

  return `postgresql://${user}:${password}@${host}:5432/${database}?sslmode=${sslmode}`;
}

function environmentFeatureVersion(): z.infer<typeof featureVersion> | undefined {
  const versionEnv = env.BLOGDANS_VERSION;
  if (!versionEnv) {
    return undefined;
  }
  const result = featureVersion.safeParse(versionEnv);
  if (!result.success) {
    logger.warn(`Invalid BLOGDANS_VERSION: ${versionEnv}. Must be "next" or "current".`);
    return undefined;
  }
  return result.data;
}

function environmentSmtp(): SmtpConfig | undefined {
  const password = readSecretIfAvailable('SMTP_PASSWORD');
  const host = env.SMTP_HOST;
  const user = env.SMTP_USER;
  const from = env.SMTP_FROM;
  if (!password || !host || !user || !from) {
    return undefined;
  }
  const port = Number(env.SMTP_PORT ?? '587');
  return { host, port, user, password, from };
}

export const config: Config = {
  databaseUrl: environmentDatabaseUrl(),
  slackWebhookUrl: readSecretIfAvailable('SLACK_WEBHOOK_URI'),
  smtp: environmentSmtp(),
  featureVersion: environmentFeatureVersion(),
  showDrafts: env.SHOW_DRAFTS === 'true',
};
