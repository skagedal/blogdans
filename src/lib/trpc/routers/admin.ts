import { router, protectedProcedure } from '../server';
import { z } from 'zod';
import { Service } from '@/lib/service';
import { TRPCError } from '@trpc/server';

const service = new Service();

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.permissions.has('admin:write')) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: `User ${ctx.user.id} is not authorized to perform this action` });
  }
  return next({
    ctx,
  });
});

export const adminRouter = router({
  getPendingComments: adminProcedure
    .query(async () => {
      return await service.getPendingComments();
    }),

  approveComment: adminProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      return await service.approveComment(input.commentId);
    }),

  deleteComment: adminProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      return await service.deleteComment(input.commentId);
    }),

  getUsers: adminProcedure
    .input(z.object({ 
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      return await service.getUsers(input.page, input.limit);
    }),
});