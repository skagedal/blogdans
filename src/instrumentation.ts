export async function register() {
  const { logger } = await import('@/logger');
  logger.info('Registering instrumentation...', { runtime: process.env.NEXT_RUNTIME });
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncPostsToDatabase } = await import('@/lib/sync-posts');
    await syncPostsToDatabase();
  }
}
