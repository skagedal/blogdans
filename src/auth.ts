import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { logger } from "./logger";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      logger.info("JWT callback triggered", { token, user, account, profile });
      return token
    },
    signIn: async ({ user, account, profile }) => {
      logger.info("SignIn callback triggered", { user, account, profile });
      return true
    }
  }
})
