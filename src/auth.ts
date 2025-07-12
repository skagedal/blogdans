import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { logger } from "./logger";
import { createUser } from "./db/repository"
import { googleProfileSchema } from "./lib/google-types";
import { Service } from "./lib/service";

const isMockMode = process.env.MOCK_USER === "true";

const service = new Service();

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: isMockMode ? [] : [Google],
  callbacks: isMockMode ? {} : {
    jwt: async ({ token, user, account, profile }) => {
      if (!profile) {
        logger.info("JWT callback triggered without profile, just return token", { token });
        return token;
      }

      try {
        logger.info("JWT callback triggered with profile", { token, user, account, profile });
        const googleProfile = googleProfileSchema.parse(profile);
        const ourUser = await service.getBlogUserFromGoogleId(googleProfile.sub);
        if (ourUser.$case === "authenticated") {
          return {
            ...token,
            blogdansUser: ourUser,
            googleId: googleProfile.sub,
          }
        } else {
          throw new Error("User not authenticated");
        }
      } catch (error) {
        logger.error("Error parsing Google profile", { error });
        throw error;
      }
    },
    session: async ({ session, token }) => {
      logger.info('Session callback triggered', { session, token });
      return {
        ...session,
        blogdansUser: token.blogdansUser,
        googleId: token.googleId,
      }
    },
    signIn: async ({ user, account, profile }) => {
      logger.info("SignIn callback triggered", { user, account, profile });
      try {
        const googleProfile = googleProfileSchema.parse(profile);
        await createUser(googleProfile);
      } catch (error) {
        logger.error("Error creating user", { error })
        return false
      }
      return true
    }
  }
})
