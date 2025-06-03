import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { logger } from "./logger";
import { createUser } from "./db/repository"
import { z } from "zod";
import { googleProfileSchema, googleUserSchema } from "./lib/google-types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      logger.info("JWT callback triggered", { token, user, account, profile });
      return token
    },
    signIn: async ({ user, account, profile }) => {
      logger.info("SignIn callback triggered", { user, account, profile });
      try {
        const googleUser = googleUserSchema.parse(user);
        const googleProfile = googleProfileSchema.parse(profile);
        await createUser(googleUser, googleProfile);
      } catch (error) {
        logger.error("Error creating user", { error })
        return false
      }
      return true
    }
  }
})
