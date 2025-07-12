import { router } from '../server';
import { postRouter } from './post';
import { adminRouter } from './admin';
import { testRouter } from './test';

export const appRouter = router({
  post: postRouter,
  admin: adminRouter,
  test: testRouter
});

export type AppRouter = typeof appRouter;