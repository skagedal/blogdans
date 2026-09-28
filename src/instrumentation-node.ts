import { logger } from "@/logger";
import { reporter } from "@/lib/reporter";
import { syncPostsToDatabase } from "@/lib/sync-posts";

export async function serverStartup() {
  logger.info("Starting service", { runtime: process.env.NEXT_RUNTIME });
  // Next.js awaits register() before serving requests, and the sync may wait
  // minutes for the database, so it runs in the background.
  void syncPosts();
}

async function syncPosts() {
  try {
    logger.info("Starting synchronization of posts to database");
    const { successCount, failureCount } = await syncPostsToDatabase();
    if (failureCount > 0) {
      logger.warn(`Failed to synchronize ${failureCount} posts to database`);
    } else {
      logger.info(`Successfully synchronized ${successCount} posts to database`);
    }
  } catch (error) {
    await reporter
      .error(`Error occurred while syncing posts to database: ${error}`)
      .catch((reportError) => logger.error("Failed to report sync error", reportError));
  }
}
