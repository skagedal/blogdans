import { router } from '../server';
import { postRouter } from './post';
import { adminRouter } from './admin';

export const appRouter = router({
  post: postRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;