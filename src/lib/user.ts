import { auth } from "@/auth";
import { BlogdansUser, User } from "./user-types";

export * from "./user-types";

export async function getUser(): Promise<User> {
  const session = await auth();
  if (session && 'blogUser' in session) {
    return {
      $case: "authenticated",
      info: session.blogUser as BlogdansUser,
    };
  }
  return { $case: "anonymous" };
}

