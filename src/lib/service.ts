import { db as globalDb } from "@/db/client";
import { reporter } from "./reporter";

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
}
