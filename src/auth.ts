import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { config } from "@/config";
import { db } from "@/db/client";
import { logger } from "./logger";

const DEFAULT_PHOTO = (id: string) => `https://picsum.photos/seed/${id}/200/300`;

export const auth = betterAuth({
  database: new Pool({ connectionString: config.databaseUrl }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders:
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? {
          google: {
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          },
        }
      : {},
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insertInto("blogdans_user")
            .values({
              id: user.id,
              photo: user.image ?? DEFAULT_PHOTO(user.id),
            })
            .onConflict((oc) => oc.column("id").doNothing())
            .execute();
          logger.info("Created blogdans_user profile row", { id: user.id });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
