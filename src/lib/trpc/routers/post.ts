import { router, protectedProcedure, publicProcedure } from '../server';
import { postCommentSchema } from '@/lib/api/comments';
import { Service } from '@/lib/service';
import { db } from '@/db/client';
import { z } from 'zod';

const service = new Service(db);

export const postRouter = router({
  submitComment: protectedProcedure
    .input(postCommentSchema)
    .mutation(async ({ input, ctx }) => {
      console.log(`trpc Submitting comment for page ${input.pageId}:`, input.comment);
      return await service.insertComment(input.pageId, ctx.user.info.id, input.comment);
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      return await service.getApprovedComments(input.postId);
    }),
});