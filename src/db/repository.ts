import { db } from "./client";
import { randomUUID } from "crypto";
import { OpenIdProfile } from "@/lib/google-types";
import { logger } from "@/logger";

// Creates a new user in the database if not existing
export async function createUser(profile: OpenIdProfile): Promise<void> {
  const existing = await db
    .selectFrom("google_user")
    .selectAll()
    .where("id", "=", profile.sub)
    .executeTakeFirst();
  if (existing) {
    logger.info("Existing user", { sub: profile.sub, userId: existing.blog_user_id });
    return;
  }
  const blogdansUserId = randomUUID();
  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("blogdans_user")
      .values({
        id: blogdansUserId,
        name: profile.name,
        email: profile.email,
        photo: profile.picture,
      })
      .execute();
    await trx
      .insertInto("google_user")
      .values({
        id: profile.sub,
        blog_user_id: blogdansUserId,
      })
      .execute();
  });
  logger.info("Created new user", {
    sub: profile.sub,
    userId: blogdansUserId,
  });
}
