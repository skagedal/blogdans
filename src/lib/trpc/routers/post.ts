import { router, publicProcedure } from '../server';
import { postCommentSchema } from '@/lib/api/comments';
import { Service } from '@/lib/service';

const service = new Service();

export const postRouter = router({
  submitComment: publicProcedure
    .input(postCommentSchema)
    .mutation(async ({ input }) => {
      console.log(`trpc Submitting comment for page ${input.pageId}:`, input.comment);
      return await service.insertComment(input.pageId, '6ab27c8a-a4d0-4bfb-ace1-2344b51d96b3', input.comment);
    }),
});