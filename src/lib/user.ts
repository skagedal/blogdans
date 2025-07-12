import { auth } from "@/auth";
import { MOCK_GOOGLE_USER_ID } from "./create-mock-user";
import { logger } from "@/logger";

export type Namespace = 'admin';
export type Action = 'read' | 'write';
export type Permission = `${Namespace}:${Action}`;

export type AuthenticatedUser = {
  $case: "authenticated";
  email: string;
  name: string;
  id: string; // This is the blogdans_user.id
  photo: string | undefined;
  permissions: Set<Permission>;
};

export type AnonymousUser = {
  $case: "anonymous";
};

// Not sure what to call this, but it represents an authenticated user which we have not yet fetched from the database.
export type AuthenticatedSession = {
  $case: "session";
  email: string;
  name: string;
  googleId: string;
  photo: string | undefined;
}

export type User = AuthenticatedUser | AnonymousUser;
export type Session = AuthenticatedSession | AnonymousUser;

async function getRealSession(): Promise<Session> {
  const session = await auth();
  logger.info("getRealSession", { session });
  if (session && session.user && session.user.email) {
    if (!session.user.id) {
      throw new Error("User ID is missing in session");
    }
    return {
      $case: "session",
      email: session.user.email,
      name: session.user.name || "Anonymous",
      googleId: session.user.id,
      photo: session.user.image || undefined,
    };
  } else {
    return {
      $case: "anonymous",
    };
  }
}

async function getMockSession(): Promise<Session> {
  return {
    $case: "session",
    name: "Mock User",
    email: "test@example.com",
    googleId: MOCK_GOOGLE_USER_ID,
    photo: "https://picsum.photos/id/237/200/200"
  };
}

export const getSession =
  process.env.MOCK_USER === "true" ? getMockSession : getRealSession;
