import type { DB } from "@/db/schema";
import { reporter } from "./reporter";
import { blogdansRole, BlogdansRole, BlogdansUser } from "./user-types";
import { sql, type Kysely } from "kysely";
import { logger } from "@/logger";

export class Service {
  constructor(private db: Kysely<DB>) {}

  async insertComment(postId: string, authorId: string, content: string) {
    try {
      // Get author name before inserting comment
      const author = await this.db
        .selectFrom("blogdans_user")
        .select("name")
        .where("id", "=", authorId)
        .executeTakeFirst();

      if (!author) {
        throw new Error(`Author with id ${authorId} not found`);
      }

      // Insert the comment
      await this.db
        .insertInto("comment")
        .values({
          author_id: authorId,
          post_id: postId,
          content: content,
        })
        .execute();

      // Send Slack notification
      const truncatedContent = content.length > 200
        ? content.substring(0, 200) + '...'
        : content;

      await reporter.richInfo({
        title: "💬 New Comment Awaiting Approval",
        fields: [
          { label: "Post", value: postId },
          { label: "Author", value: author.name },
          { label: "Comment", value: truncatedContent }
        ]
      });

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

  async getApprovedComments(postId: string) {
    try {
      return await this.db
        .selectFrom("comment")
        .innerJoin("blogdans_user", "comment.author_id", "blogdans_user.id")
        .selectAll("comment")
        .select(["blogdans_user.name as author_name", "blogdans_user.photo as author_photo"])
        .where("comment.post_id", "=", postId)
        .where("comment.approved_at", "is not", null)
        .orderBy("comment.created_at", "asc")
        .execute();
    } catch (error) {
      reporter.error(`Failed to get approved comments for post ${postId}: ${error}`);
      throw new Error("Failed to get approved comments", { cause: error });
    }
  }

  async getUserPendingComments(postId: string, userId: string) {
    try {
      return await this.db
        .selectFrom("comment")
        .innerJoin("blogdans_user", "comment.author_id", "blogdans_user.id")
        .selectAll("comment")
        .select(["blogdans_user.name as author_name", "blogdans_user.photo as author_photo"])
        .where("comment.post_id", "=", postId)
        .where("comment.author_id", "=", userId)
        .where("comment.approved_at", "is", null)
        .orderBy("comment.created_at", "asc")
        .execute();
    } catch (error) {
      reporter.error(`Failed to get pending comments for post ${postId} and user ${userId}: ${error}`);
      throw new Error("Failed to get user pending comments", { cause: error });
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

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const userRoles = await this.db
            .selectFrom("user_roles")
            .select("role")
            .where("user_id", "=", user.id)
            .execute();
          
          return {
            ...user,
            roles: userRoles.map(r => r.role)
          };
        })
      );

      const total = await this.db
        .selectFrom("blogdans_user")
        .select(({ fn }) => fn.count<number>("id").as("count"))
        .executeTakeFirstOrThrow();

      // Convert count to number since PostgreSQL returns bigint as string
      const totalCount = Number(total.count);

      return {
        users: usersWithRoles,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
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

  async getOrCreateGoogleLink(googleId: string): Promise<string> {
    const inserted = await this.db.insertInto("google_user"
      ).values({ 
        id: googleId, 
        blog_user_id: sql`gen_random_uuid()`
      })
      .returning("blog_user_id")
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
    
    if (inserted[0]) {
      return inserted[0].blog_user_id;
    }

    // If the insert didn't happen, it means the user already exists
    const existing = await this.db
      .selectFrom("google_user")
      .select("blog_user_id")
      .where("id", "=", googleId)
      .executeTakeFirst();

    if (!existing) {
      throw new Error(`Google user ${googleId} not found`);
    }
    return existing.blog_user_id;
  }

  async getOrCreateBlogUser(blogdansUser: Omit<BlogdansUser, 'roles'>): Promise<BlogdansUser> {
    const {id, name, email, photo} = blogdansUser;
    const inserted = await this.db
      .insertInto("blogdans_user")
      .values({ id, name, email, photo })
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    if (inserted.length === 0) {
      logger.info(`Blog user ${id} already exists, returning existing user`);
      return {...blogdansUser, roles: await this.getRoles(id)};
    }
    if (inserted.length === 1) {
      reporter.info(`Created new blog user ${id}`);
      return {...blogdansUser, roles: await this.getRoles(id)};
    }
    throw new Error(`Unexpected number of inserted blog users: ${inserted.length}`);
  }

  private async getRoles(id: string): Promise<BlogdansRole[]> {
    const roles = await this.db
      .selectFrom("user_roles")
      .select("role")
      .where("user_id", "=", id)
      .execute();

    return roles.flatMap(role => blogdansRole.parse(role.role));
  }
}
