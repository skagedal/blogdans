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
      ctx.permission.check('comment:write');
      console.log(`trpc Submitting comment for page ${input.pageId}:`, input.comment);
      return await service.insertComment(input.pageId, ctx.user.info.id, input.comment);
    }),

  getComments: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input, ctx }) => {
      const approvedComments = await service.getApprovedComments(input.postId);

      // If user is authenticated, also get their pending comments
      if (ctx.user.$case === 'authenticated') {
        const pendingComments = await service.getUserPendingComments(input.postId, ctx.user.info.id);

        // Combine and sort by created_at
        const allComments = [...approvedComments, ...pendingComments];
        allComments.sort((a, b) => {
          // TODO: There is no reason created_at should be nullable, should fix that in the 
          // migrations
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA - dateB;
        });

        return allComments;
      }

      return approvedComments;
    }),
});