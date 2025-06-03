import z from "zod"
import { db } from "./client"
import { randomUUID } from "crypto"

// This is the "profile" field in the signIn from Google
const profileSchema = z.object({
    id: z.string(),
    at_hash: z.string(),
    email: z.string().email(),
    email_verified: z.boolean(),
    family_name: z.string(),
    given_name: z.string(),
    name: z.string(),
    picture: z.string().url(),
})

// This is the "user" field
const userSchema = z.object({
    id: z.string()
})


// Creates a new user in the database if not existing
export async function createUser(profile: unknown): Promise<void> {
  const parsed = profileSchema.parse(profile)
  const existing = await db
    .selectFrom("google_user")
    .selectAll()
    .where("id", "=", parsed.id)
    .executeTakeFirst()
  if (!existing) {
    const blogUserId = randomUUID()
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto("blogdans_user")
        .values({
          id: blogUserId,
          name: parsed.name,
          email: parsed.email,
          photo: parsed.picture
        })
        .execute()
      await trx
        .insertInto("google_user")
        .values({
          id: parsed.id,
          blog_user_id: blogUserId
        })
        .execute()
    })
  }
}

