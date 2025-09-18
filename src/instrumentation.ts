export async function register() {
  const { logger } = await import('@/logger');
  logger.info('Registering instrumentation...', { runtime: process.env.NEXT_RUNTIME });
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { syncPostsToDatabase } = await import('@/lib/sync-posts');
      await syncPostsToDatabase();
      logger.info('Post synchronization completed successfully');
    } catch (error) {
      logger.error('Error occurred while syncing posts to database', error);
    }
  }
}
