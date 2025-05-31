import { auth } from "@/auth";

export type AuthenticatedUser = {
  $case: "authenticated";
  email: string;
  name: string;
  id: string | undefined;
  photo: string | undefined;
};

export type AnonymousUser = {
  $case: "anonymous";
};

export type User = AuthenticatedUser | AnonymousUser;

async function getRealUser(): Promise<User> {
  const session = await auth();
  if (session && session.user && session.user.email) {
    return {
      $case: "authenticated",
      name: session.user.name || "Anonymous",
      email: session.user.email,
      id: session.user.id,
      photo: session.user.image || undefined,
    };
  } else {
    return {
      $case: "anonymous",
    };
  }
}

async function getMockUser(): Promise<User> {
  return {
    $case: "authenticated",
    name: "Mock User",
    email: "test@example.com",
    id: "mock-id",
    photo: "https://picsum.photos/id/237/200/200"
  };
}

export const getUser =
  process.env.MOCK_USER === "true" ? getMockUser : getRealUser;
