import { db } from "./client";
import { randomUUID } from "crypto";
import { GoogleProfile, GoogleUser } from "@/lib/google-types";
import { logger } from "@/logger";

// Creates a new user in the database if not existing
export async function createUser(
  googleUser: GoogleUser,
  googleProfile: GoogleProfile
): Promise<void> {
  const existing = await db
    .selectFrom("google_user")
    .selectAll()
    .where("id", "=", googleUser.id)
    .executeTakeFirst();
  if (existing) {
    logger.info("Existing user", { googleUserId: googleUser.id, blogdansUserId: existing.blog_user_id });
    return;
  }
  const blogdansUserId = randomUUID();
  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto("blogdans_user")
      .values({
        id: blogdansUserId,
        name: googleProfile.name,
        email: googleProfile.email,
        photo: googleProfile.picture,
      })
      .execute();
    await trx
      .insertInto("google_user")
      .values({
        id: googleProfile.id,
        blog_user_id: blogdansUserId,
      })
      .execute();
  });
  logger.info("Created new user", {
    googleUser: googleUser.id,
    blogdansUserId: blogdansUserId,
  });
}
