import { Kysely, PostgresDialect } from 'kysely';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DB } from '@/db/schema';
import { Pool } from 'pg';
import { sql } from "kysely";
import { execSync } from 'child_process';
import path from 'path';
import { Service } from './service';

describe('service tests using real db', () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<DB>;
  let service: Service;

  beforeAll(async () => {
    // Start PostgreSQL container with reuse enabled
    container = await new PostgreSqlContainer('postgres:16')
      .withReuse()
      .withDatabase('testdb')
      .withUsername('testuser')
      .withPassword('testpass')
      .start();

    // Create database connection
    const connectionString = container.getConnectionUri();

    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString }),
      }),
    });

    // Run migrations using dbmate
    const dbmatePath = path.join(process.cwd(), 'node_modules/.bin/dbmate');
    const dbDir = path.join(process.cwd(), 'db');
    
    // Add sslmode=disable to the connection string for dbmate
    const dbmateConnectionString = connectionString.includes('?') 
      ? `${connectionString}&sslmode=disable`
      : `${connectionString}?sslmode=disable`;
    
    execSync(`${dbmatePath} up`, {
      env: {
        ...process.env,
        DATABASE_URL: dbmateConnectionString,
        DBMATE_MIGRATIONS_DIR: path.join(dbDir, 'migrations'),
        DBMATE_SCHEMA_FILE: path.join(dbDir, 'schema.sql')
      },
      stdio: 'inherit'
    });
    
    // Create service instance with test database
    service = new Service(db);
  }, 30000);

  afterAll(async () => {
    await db.destroy();
    await container.stop();
  });

  beforeEach(async () => {
    // Clean up test data before each test

    await db.deleteFrom('comment').execute();
    await db.deleteFrom('google_user').execute();
    await db.deleteFrom('blogdans_user').execute();
    await db.deleteFrom('post').execute();
  });

  it('can perform some database operations', async () => {    
    const result = await db.executeQuery(sql`SELECT 1`.compile(db));

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty('?column?', 1);
  });

  it('can do nothing', async () => {
    expect(true).toBeTruthy();
  });
});