import { env } from "node:process";
import { readFileSync } from "node:fs";
import { logger } from "./logger";
import z from "zod";

const featureVersion = z.enum(["next", "current"]);

type Config = {
  databaseUrl: string;
  slackWebhookUrl?: string;
  featureVersion: z.infer<typeof featureVersion> | undefined;
  showDrafts: boolean;
};

function readSecret(name: string): string | undefined {
  if (env[name]) {
    return env[name].trim();
  }
  const filePath = env[`${name}_FILE`];
  if (!filePath) {
    logger.warn(`Neither ${name} nor ${name}_FILE is set.`);
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
  const password = readSecret("DATABASE_PASSWORD");
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

export const config: Config = {
  databaseUrl: environmentDatabaseUrl(),
  slackWebhookUrl: readSecret('SLACK_WEBHOOK_URI'),
  featureVersion: environmentFeatureVersion(),
  showDrafts: env.SHOW_DRAFTS === 'true',
};
