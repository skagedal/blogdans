import { logger } from '@/logger';

export async function register() {
  logger.info('Registering instrumentation...', { runtime: process.env.NEXT_RUNTIME });
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncPostsToDatabase } = await import('./src/lib/sync-posts');
    await syncPostsToDatabase();
  }
}