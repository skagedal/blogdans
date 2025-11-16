import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { getUser, User } from "../user";
import { getPermissions, Permission } from "../user-types";

interface PermissionChecker {
  check(permission: Permission): void;
}

interface TRPCContext {
  user: User;
  permission: PermissionChecker;
}

async function createContext(): Promise<TRPCContext> {
  const user = await getUser();
  const permissions = getPermissions(user);

  return {
    user,
    permission: {
      check(permission: Permission) {
        if (!permissions.has(permission)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: `User does not have permission: ${permission}`,
          });
        }
      },
    },
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.$case === "anonymous") {
    throw new Error("You must be logged in to access this resource");
  }
  return next({ ctx: { ...ctx, isAuthenticated: true, user: ctx.user } });
});
export const middleware = t.middleware;
export { createContext };

