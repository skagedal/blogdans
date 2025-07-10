export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { syncPostsToDatabase } = await import('./src/lib/sync-posts');
    await syncPostsToDatabase();
    
    if (process.env.MOCK_USER === 'true') {
      const { createMockUser } = await import('./src/lib/create-mock-user');
      await createMockUser();
    }
  }
}