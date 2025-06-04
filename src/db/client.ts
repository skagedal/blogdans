import { Kysely, PostgresDialect } from "kysely";
import fs from 'fs';
import { Pool } from "pg";
import type { DB } from "./schema";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: (() => {
      const passwordFile = process.env.DATABASE_PASSWORD_FILE || '/run/secrets/db-password';
      const password = fs.readFileSync(passwordFile, 'utf8').trim();
      const user = process.env.DATABASE_USER as string;
      const host = process.env.DATABASE_HOST as string;
      const database = process.env.DATABASE_NAME as string;
      const sslmode = process.env.DATABASE_SSLMODE || 'disable';
      return `postgresql://${user}:${password}@${host}:5432/${database}?sslmode=${sslmode}`;
    })() })
  })
});
