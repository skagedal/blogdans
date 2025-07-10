import { db } from "@/db/client";
import { logger } from "@/logger";

export const MOCK_USER_ID = "00000000-0000-4000-8000-000000000001";
const MOCK_GOOGLE_USER_ID = "mock-google-id";

export async function createMockUser(): Promise<void> {
  try {
    const existing = await db
      .selectFrom("blogdans_user")
      .selectAll()
      .where("id", "=", MOCK_USER_ID)
      .executeTakeFirst();
    
    if (existing) {
      logger.info("Mock user already exists", { userId: MOCK_USER_ID });
      return;
    }

    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto("blogdans_user")
        .values({
          id: MOCK_USER_ID,
          name: "Mock User",
          email: "test@example.com",
          photo: "https://picsum.photos/id/237/200/200",
        })
        .execute();
      
      await trx
        .insertInto("google_user")
        .values({
          id: MOCK_GOOGLE_USER_ID,
          blog_user_id: MOCK_USER_ID,
        })
        .execute();
    });
    
    logger.info("Created mock user", { userId: MOCK_USER_ID });
  } catch (error) {
    logger.error("Error creating mock user", { error });
  }
}