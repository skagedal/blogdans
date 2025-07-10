import { db as globalDb } from "@/db/client";
import { reporter } from "./reporter";
import { getSession, Permission, User } from "./user";

export class Service {
  db = globalDb;

  constructor() {}

  async insertComment(postId: string, authorId: string, content: string) {
    try {
      await this.db
        .insertInto("comment")
        .values({
          author_id: authorId,
          post_id: postId,
          content: content,
        })
        .execute();
      return { };
    } catch (error) {
      reporter.error(`Failed to insert comment for post ${postId}: ${error}`);
      throw new Error("Failed to post comment", { cause: error });
    }
  }

  async getPendingComments() {
    try {
      return await this.db
        .selectFrom("comment")
        .innerJoin("blogdans_user", "comment.author_id", "blogdans_user.id")
        .selectAll("comment")
        .select(["blogdans_user.name as author_name", "blogdans_user.email as author_email"])
        .where("comment.approved_at", "is", null)
        .orderBy("comment.created_at", "desc")
        .execute();
    } catch (error) {
      reporter.error(`Failed to get pending comments: ${error}`);
      throw new Error("Failed to get pending comments", { cause: error });
    }
  }

  async approveComment(commentId: string) {
    try {
      await this.db
        .updateTable("comment")
        .set({ approved_at: new Date() })
        .where("id", "=", commentId)
        .execute();
      return { success: true };
    } catch (error) {
      reporter.error(`Failed to approve comment ${commentId}: ${error}`);
      throw new Error("Failed to approve comment", { cause: error });
    }
  }

  async deleteComment(commentId: string) {
    try {
      await this.db
        .deleteFrom("comment")
        .where("id", "=", commentId)
        .execute();
      return { success: true };
    } catch (error) {
      reporter.error(`Failed to delete comment ${commentId}: ${error}`);
      throw new Error("Failed to delete comment", { cause: error });
    }
  }

  async getUsers(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const users = await this.db
        .selectFrom("blogdans_user")
        .selectAll()
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset)
        .execute();

      const total = await this.db
        .selectFrom("blogdans_user")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .executeTakeFirstOrThrow();

      return {
        users,
        total: total.count,
        page,
        limit,
        totalPages: Math.ceil(total.count / limit)
      };
    } catch (error) {
      reporter.error(`Failed to get users: ${error}`);
      throw new Error("Failed to get users", { cause: error });
    }
  }

  async syncPostToDatabase(slug: string) {
    try {
      await this.db
        .insertInto("post")
        .values({ id: slug })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    } catch (error) {
      reporter.error(`Failed to sync post ${slug} to database: ${error}`);
      throw new Error("Failed to sync post to database", { cause: error });
    }
  }

  async getCurrentUser(): Promise<User> {
    const session = await getSession();
    switch (session.$case) {
      case "session":
        return this.getBlogUserFromGoogleId(session.googleId);
      case "anonymous":
        return { $case: "anonymous" };
      default:
        throw new Error("Unknown user case");
    }
  }

  async getBlogUser(userId: string) {
    try {
      return await this.db
        .selectFrom("blogdans_user")
        .selectAll()
        .where("id", "=", userId)
        .executeTakeFirst();
    } catch (error) {
      reporter.error(`Failed to get blog user ${userId}: ${error}`);
      throw new Error("Failed to get blog user", { cause: error });
    }
  }

  async getBlogUserFromGoogleId(googleId: string): Promise<User> {
    try {
      const result = await this.db
        .selectFrom("google_user")
        .innerJoin("blogdans_user", "google_user.blog_user_id", "blogdans_user.id")
        .selectAll("blogdans_user")
        .where("google_user.id", "=", googleId)
        .executeTakeFirst();

      if (!result) {
        throw new Error("User not found");
      }

      return {
        $case: "authenticated",
        email: result.email,
        name: result.name,
        id: result.id,
        photo: result.photo,
        permissions: new Set<Permission>(),
      };
    } catch (error) {
      reporter.error(`Failed to get blog user from Google ID ${googleId}: ${error}`);
      throw new Error("Failed to get blog user from Google ID", { cause: error });
    }
  }

  async createBlogUser(id: string, name: string, email: string, photo: string) {
    try {
      await this.db
        .insertInto("blogdans_user")
        .values({ id, name, email, photo })
        .execute();
    } catch (error) {
      reporter.error(`Failed to create blog user ${id}: ${error}`);
      throw new Error("Failed to create blog user", { cause: error });
    }
  }

  async createGoogleUser(id: string, blogUserId: string) {
    try {
      await this.db
        .insertInto("google_user")
        .values({ id, blog_user_id: blogUserId })
        .execute();
    } catch (error) {
      reporter.error(`Failed to create google user ${id}: ${error}`);
      throw new Error("Failed to create google user", { cause: error });
    }
  }

  async transaction<T>(callback: (trx: typeof this.db) => Promise<T>): Promise<T> {
    return await this.db.transaction().execute(callback);
  }
}
