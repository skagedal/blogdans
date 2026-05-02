import z from "zod";

export const blogdansRole = z.enum(['admin', 'commenter']);

export const blogdansUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  photo: z.string().url(),
  roles: z.array(blogdansRole),
});

export type BlogdansUser = z.infer<typeof blogdansUserSchema>;
export type BlogdansRole = z.infer<typeof blogdansRole>;
export type Namespace = 'admin' | 'comment';
export type Action = 'read' | 'write';
export type Permission = `${Namespace}:${Action}`;

export type AuthenticatedUser = {
  $case: "authenticated";
  info: BlogdansUser;
};

export type AnonymousUser = {
  $case: "anonymous";
};

export type User = AuthenticatedUser | AnonymousUser;

export function getPermissions(user: User): Set<Permission> {
  if (user.$case === "authenticated") {
    const permissions = new Set<Permission>();

    // All authenticated users can comment
    permissions.add("comment:write");

    if (user.info.roles.includes("admin")) {
      permissions.add("admin:read");
      permissions.add("admin:write");
    }
    return permissions;
  }
  return new Set();
}