async function serverStartup() {
  const { logger } = await import("@/logger");
  logger.info("Starting service", { runtime: process.env.NEXT_RUNTIME });
  try {
    const { syncPostsToDatabase } = await import("@/lib/sync-posts");

    logger.info("Starting synchronization of posts to database");
    const { successCount, failureCount } = await syncPostsToDatabase();
    if (failureCount > 0) {
      logger.warn(`Failed to synchronize ${failureCount} posts to database`);
    }
    logger.info(`Successfully synchronized ${successCount} posts to database`);
  } catch (error) {
    logger.error("Error occurred while syncing posts to database", error);
  }
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await serverStartup();
  }
}
