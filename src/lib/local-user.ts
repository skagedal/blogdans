import { BlogdansUser } from "./user";

export const localUsers: Map<string, BlogdansUser> = new Map([
    [
        "admin",
        {
            id: "00000000-0000-4000-8000-000000000001",
            email: "admin@example.com",
            name: "Admin",
            photo: "https://picsum.photos/id/237/200/200",
            roles: ["admin"]
        }
    ],
    [
        "commenter",
        {
            id: "00000000-0000-4000-8000-000000000002",
            email: "commenter@example.com",
            name: "Commenter",
            photo: "https://picsum.photos/id/238/200/200",
            roles: ["commenter"]
        }
    ]
]);

export async function getLocalUser(username: string): Promise<BlogdansUser | null> {
    return localUsers.get(username) || null;
}
