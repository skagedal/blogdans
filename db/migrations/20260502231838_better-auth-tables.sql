-- migrate:up

-- Better Auth's standard tables (matches `npx @better-auth/cli generate`)
CREATE TABLE "user" (
    "id" text NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "emailVerified" boolean NOT NULL,
    "image" text,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "session" (
    "id" text NOT NULL PRIMARY KEY,
    "expiresAt" timestamptz NOT NULL,
    "token" text NOT NULL UNIQUE,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);

CREATE TABLE "account" (
    "id" text NOT NULL PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamptz,
    "refreshTokenExpiresAt" timestamptz,
    "scope" text,
    "password" text,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz NOT NULL
);

CREATE TABLE "verification" (
    "id" text NOT NULL PRIMARY KEY,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" timestamptz NOT NULL,
    "createdAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX "session_userId_idx" ON "session" ("userId");
CREATE INDEX "account_userId_idx" ON "account" ("userId");
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");

-- Migrate blogdans_user rows into Better Auth's user table.
-- We keep the existing UUIDs (cast to text) so that comment.author_id continues to point at the same row.
INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
SELECT id::text, name, email, true, photo, created_at, updated_at
FROM blogdans_user;

-- Migrate google_user rows into Better Auth's account table.
INSERT INTO "account" ("id", "accountId", "providerId", "userId", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, gu.id, 'google', gu.blog_user_id::text, gu.created_at, gu.updated_at
FROM google_user gu;

-- Repurpose blogdans_user as a slim profile table joined to "user".
-- Drop FKs that reference its uuid id so we can change the column type.
ALTER TABLE comment DROP CONSTRAINT comment_author_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT user_roles_user_id_fkey;

-- Name and email now live on "user".
ALTER TABLE blogdans_user DROP COLUMN name;
ALTER TABLE blogdans_user DROP COLUMN email;

-- Switch id columns from uuid to text so they match "user"."id".
ALTER TABLE blogdans_user ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE comment ALTER COLUMN author_id TYPE text USING author_id::text;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE text USING user_id::text;

-- Re-add FKs. blogdans_user.id is now both PK and FK to "user".
ALTER TABLE blogdans_user
    ADD CONSTRAINT blogdans_user_id_fkey FOREIGN KEY (id) REFERENCES "user"(id) ON DELETE CASCADE;
ALTER TABLE comment
    ADD CONSTRAINT comment_author_id_fkey FOREIGN KEY (author_id) REFERENCES blogdans_user(id);
ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES blogdans_user(id);

-- google_user is replaced by Better Auth's account table.
DROP TABLE google_user;

-- migrate:down

-- This migration is destructive and not reversibly automated.
-- The down migration restores the table shapes but does not restore data.
CREATE TABLE google_user (
    id text NOT NULL PRIMARY KEY,
    blog_user_id uuid NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TRIGGER google_user_updated_at_trigger BEFORE UPDATE ON google_user
    FOR EACH ROW EXECUTE FUNCTION updated_at_trigger();

ALTER TABLE comment DROP CONSTRAINT comment_author_id_fkey;
ALTER TABLE user_roles DROP CONSTRAINT user_roles_user_id_fkey;
ALTER TABLE blogdans_user DROP CONSTRAINT blogdans_user_id_fkey;

ALTER TABLE blogdans_user ALTER COLUMN id TYPE uuid USING id::uuid;
ALTER TABLE comment ALTER COLUMN author_id TYPE uuid USING author_id::uuid;
ALTER TABLE user_roles ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

ALTER TABLE blogdans_user ADD COLUMN name text NOT NULL DEFAULT '';
ALTER TABLE blogdans_user ADD COLUMN email text NOT NULL DEFAULT '';

ALTER TABLE comment
    ADD CONSTRAINT comment_author_id_fkey FOREIGN KEY (author_id) REFERENCES blogdans_user(id);
ALTER TABLE user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES blogdans_user(id);

DROP INDEX "verification_identifier_idx";
DROP INDEX "account_userId_idx";
DROP INDEX "session_userId_idx";
DROP TABLE "verification";
DROP TABLE "account";
DROP TABLE "session";
DROP TABLE "user";
