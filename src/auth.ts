import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { sql } from "kysely";
import { Pool } from "pg";
import { config } from "@/config";
import { db } from "@/db/client";
import { sendEmail } from "@/lib/email";
import { reporter } from "@/lib/reporter";
import { logger } from "./logger";

const DEFAULT_PHOTO = (id: string) => `https://picsum.photos/seed/${id}/200/300`;

// Resend free tier is 100/day, 3000/month. Cap well below that so a flood
// of password-reset requests can't burn the quota and lock the account out
// of legitimate sends. Counted across the whole site, not per user.
const PASSWORD_RESET_DAILY_LIMIT = 30;

async function sendPasswordResetEmail(email: string, url: string): Promise<void> {
  const { count } = await db
    .selectFrom("password_reset_log")
    .select(({ fn }) => fn.count<number>("id").as("count"))
    .where("sent_at", ">", sql<Date>`CURRENT_TIMESTAMP - INTERVAL '24 hours'`)
    .executeTakeFirstOrThrow();

  if (Number(count) >= PASSWORD_RESET_DAILY_LIMIT) {
    reporter.error(
      `Password reset daily quota of ${PASSWORD_RESET_DAILY_LIMIT} exceeded; dropped reset email for ${email}`
    );
    return;
  }

  await db.insertInto("password_reset_log").values({ email }).execute();
  await sendEmail({
    to: email,
    subject: "Reset your skagedal.tech password",
    text: `Click the link to reset your password: ${url}\n\nIf you didn't ask for this, you can ignore this email.`,
    html: `<p>Click the link to reset your password:</p><p><a href="${url}">${url}</a></p><p>If you didn't ask for this, you can ignore this email.</p>`,
  });
  logger.info("Sent password reset email", { email });
}

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
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail(user.email, url);
    },
  },
  rateLimit: {
    customRules: {
      // Stricter limit on the password-reset request endpoint to make
      // quota-burning attacks unattractive. Three attempts per IP per
      // hour is plenty for a real user.
      "/request-password-reset": { window: 3600, max: 3 },
    },
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
