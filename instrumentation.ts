export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncPostsToDatabase } = await import('./src/lib/sync-posts');
    await syncPostsToDatabase();
  }
}