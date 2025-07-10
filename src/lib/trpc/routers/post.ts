import { router, protectedProcedure } from '../server';
import { postCommentSchema } from '@/lib/api/comments';
import { Service } from '@/lib/service';

const service = new Service();

export const postRouter = router({
  submitComment: protectedProcedure
    .input(postCommentSchema)
    .mutation(async ({ input, ctx }) => {
      console.log(`trpc Submitting comment for page ${input.pageId}:`, input.comment);
      return await service.insertComment(input.pageId, ctx.user.id, input.comment);
    }),
});