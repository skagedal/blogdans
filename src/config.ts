import { env } from "node:process";
import { readFileSync } from "node:fs";

type Config = {
  databaseUrl: string;
};

function environmentDatabaseUrl() {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  const passwordFile = env.DATABASE_PASSWORD_FILE;
  const password = passwordFile
    ? readFileSync(passwordFile, "utf8").trim()
    : "dummy";
  const user = process.env.DATABASE_USER as string;
  const host = process.env.DATABASE_HOST as string;
  const database = process.env.DATABASE_NAME as string;
  const sslmode = process.env.DATABASE_SSLMODE || "disable";

  return `postgresql://${user}:${password}@${host}:5432/${database}?sslmode=${sslmode}`;
}

export const config: Config = {
  databaseUrl: environmentDatabaseUrl(),
};
