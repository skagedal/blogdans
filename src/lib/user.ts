import { headers } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { blogdansRole, BlogdansUser, User } from "./user-types";

export * from "./user-types";

export async function getUser(): Promise<User> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { $case: "anonymous" };
  }

  const row = await db
    .selectFrom("user")
    .innerJoin("blogdans_user", "blogdans_user.id", "user.id")
    .select([
      "user.id",
      "user.name",
      "user.email",
      "blogdans_user.photo",
    ])
    .where("user.id", "=", session.user.id)
    .executeTakeFirst();

  if (!row) {
    return { $case: "anonymous" };
  }

  const roleRows = await db
    .selectFrom("user_roles")
    .select("role")
    .where("user_id", "=", row.id)
    .execute();
  const roles = roleRows.flatMap((r) => blogdansRole.parse(r.role));

  const info: BlogdansUser = {
    id: row.id,
    name: row.name,
    email: row.email,
    photo: row.photo,
    roles,
  };
  return { $case: "authenticated", info };
}
