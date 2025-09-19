import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { logger } from "./logger";
import { googleProfileSchema } from "./lib/google-types";
import { getLocalUser } from "./lib/local-user";
import { Service } from "./lib/service";
import { blogdansUserSchema } from "./lib/user";
import { db } from "./db/client";

const isMockMode = process.env.MOCK_USER === "true";

function createLocalProvider() {
  return CredentialsProvider({
    name: "Local",
    credentials: {
      username: { label: "Username", type: "text", placeholder: "admin" },
    },
    async authorize(credentials) {
      const { username } = credentials;
      return getLocalUser(username as string);
    },
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: isMockMode ? [createLocalProvider()] : [Google],
  callbacks: {
    jwt: async ({ token, user, account, profile }) => {
      const service = new Service(db);

      logger.info("JWT callback triggered", { token, user, account, profile });
      if (!account) {
        return token;
      }
      if (account.provider === "credentials") {
        const authedUser = blogdansUserSchema.safeParse(user);
        if (authedUser.success) {
          const blogUser = await service.getOrCreateBlogUser(authedUser.data);
          return {
            ...token,
            blogUser,
          };
        } else if (!authedUser.success) {
          logger.error("Invalid user data from credentials provider", {
            error: authedUser.error,
          });
        }
      }
      if (account.provider === "google") {
        const googleProfile = googleProfileSchema.safeParse(profile);
        if (googleProfile.success) {
          const id = await service.getOrCreateGoogleLink(googleProfile.data.sub);
          const blogUser = await service.getOrCreateBlogUser({
            id,
            name: googleProfile.data.name,
            email: googleProfile.data.email,
            photo: googleProfile.data.picture ?? `https://picsum.photos/seed/${id}/200/300`,
          });
          return {
            ...token,
            blogUser,
          };
        } else {
          logger.error("Invalid Google profile data", {
            error: googleProfile.error,
          });
        }
      }
      throw new Error("Unsupported account provider");
    },
    session: async ({ session, token }) => {
      logger.info("Session callback triggered", { session, token });
      if (token) {
        return {
          ...session,
          blogUser: token.blogUser,
        };
      }
      return session;
    },
  },
});
