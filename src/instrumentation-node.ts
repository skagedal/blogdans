import { logger } from "@/logger";
import { syncPostsToDatabase } from "@/lib/sync-posts";

export async function serverStartup() {
  logger.info("Starting service", { runtime: process.env.NEXT_RUNTIME });
  try {
    logger.info("Starting synchronization of posts to database");
    const { successCount, failureCount } = await syncPostsToDatabase();
    if (failureCount > 0) {
      logger.warn(`Failed to synchronize ${failureCount} posts to database`);
    } else {
      logger.info(`Successfully synchronized ${successCount} posts to database`);
    }
  } catch (error) {
    logger.error("Error occurred while syncing posts to database", error);
  }
}
