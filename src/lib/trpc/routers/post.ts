import { z } from 'zod';
import { router, publicProcedure } from '../server';

export const postRouter = router({
  getAll: publicProcedure.query(async () => {
    console.log("Fetching all posts");
    return { posts: [] };
  }),
  
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      console.log(`Fetching post by slug: ${input.slug}`);
      return { slug: input.slug };
    }),
});