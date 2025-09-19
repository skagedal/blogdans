import { Kysely, PostgresDialect } from "kysely";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { DB } from "@/db/schema";
import { Pool } from "pg";
import { sql } from "kysely";
import { execSync } from "child_process";
import path from "path";
import { Service } from "./service";
import { v4 as uuidv4 } from "uuid";

describe("service tests using real db", () => {
  let container: StartedPostgreSqlContainer;
  let db: Kysely<DB>;
  let service: Service;

  beforeAll(async () => {
    // Start PostgreSQL container with reuse enabled
    container = await new PostgreSqlContainer("postgres:16")
      .withReuse()
      .withDatabase("testdb")
      .withUsername("testuser")
      .withPassword("testpass")
      .start();

    // Create database connection
    const connectionString = container.getConnectionUri();

    db = new Kysely<DB>({
      dialect: new PostgresDialect({
        pool: new Pool({ connectionString }),
      }),
    });

    // Run migrations using dbmate
    const dbmatePath = path.join(process.cwd(), "node_modules/.bin/dbmate");
    const dbDir = path.join(process.cwd(), "db");

    // Add sslmode=disable to the connection string for dbmate
    const dbmateConnectionString = connectionString.includes("?")
      ? `${connectionString}&sslmode=disable`
      : `${connectionString}?sslmode=disable`;

    try {
      execSync(`${dbmatePath} up`, {
        env: {
          ...process.env,
          DATABASE_URL: dbmateConnectionString,
          DBMATE_MIGRATIONS_DIR: path.join(dbDir, "migrations"),
          DBMATE_NO_DUMP_SCHEMA: "true",
        },
        stdio: "pipe",
        encoding: "utf8",
      });
    } catch (error: any) {
      console.error(
        "dbmate failed:",
        error.stdout || error.stderr || error.message
      );
      throw error;
    }

    // Create service instance with test database
    service = new Service(db);
  }, 30000);

  afterAll(async () => {
    await db.destroy();
    await container.stop();
  });

  beforeEach(async () => {
    // Clean up test data before each test

    await db.deleteFrom("comment").execute();
    await db.deleteFrom("google_user").execute();
    await db.deleteFrom("blogdans_user").execute();
    await db.deleteFrom("post").execute();
  });

  it("can perform some database operations", async () => {
    const result = await db.executeQuery(sql`SELECT 1`.compile(db));

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toHaveProperty("?column?", 1);
  });

  it("should insert a comment successfully", async () => {
    const postId = "test-post";
    const authorId = uuidv4();
    const content = "Test comment content";

    // First create required dependencies
    await db.insertInto("post").values({ id: postId }).execute();
    await db
      .insertInto("blogdans_user")
      .values({
        id: authorId,
        name: "Test User",
        email: "test@example.com",
        photo: "test-photo.jpg",
      })
      .execute();

    const result = await service.insertComment(postId, authorId, content);

    expect(result).toEqual({});

    // Verify the comment was inserted
    const comments = await db.selectFrom("comment").selectAll().execute();
    expect(comments).toHaveLength(1);
    expect(comments[0].post_id).toBe(postId);
    expect(comments[0].author_id).toBe(authorId);
    expect(comments[0].content).toBe(content);
    expect(comments[0].approved_at).toBeNull();
  });

  it("should throw error when commenting on that post does not exist", async () => {
    const postId = "non-existent-post";
    const authorId = uuidv4();
    const content = "Test comment content";

    await db
      .insertInto("blogdans_user")
      .values({
        id: authorId,
        name: "Test User",
        email: "test@example.com",
        photo: "test-photo.jpg",
      })
      .execute();

    await expect(
      service.insertComment(postId, authorId, content)
    ).rejects.toThrow();
  });

  describe("getPendingComments", () => {
    it("should return pending comments with author information", async () => {
      const postId = "test-post";
      const authorId = uuidv4();
      const content = "Test comment content";

      await db.insertInto("post").values({ id: postId }).execute();
      await db
        .insertInto("blogdans_user")
        .values({
          id: authorId,
          name: "Test User",
          email: "test@example.com",
          photo: "test-photo.jpg",
        })
        .execute();

      await service.insertComment(postId, authorId, content);

      const pendingComments = await service.getPendingComments();

      expect(pendingComments).toHaveLength(1);
      expect(pendingComments[0].post_id).toBe(postId);
      expect(pendingComments[0].author_id).toBe(authorId);
      expect(pendingComments[0].content).toBe(content);
      expect(pendingComments[0].author_name).toBe("Test User");
      expect(pendingComments[0].author_email).toBe("test@example.com");
      expect(pendingComments[0].approved_at).toBeNull();
    });

    it("should not return approved comments", async () => {
      const postId = "test-post";
      const authorId = uuidv4();
      const content = "Test comment content";

      await db.insertInto("post").values({ id: postId }).execute();
      await db
        .insertInto("blogdans_user")
        .values({
          id: authorId,
          name: "Test User",
          email: "test@example.com",
          photo: "test-photo.jpg",
        })
        .execute();

      await service.insertComment(postId, authorId, content);

      // Get the comment ID and approve it
      const comments = await db.selectFrom("comment").selectAll().execute();
      const commentId = comments[0].id;
      await service.approveComment(commentId);

      const pendingComments = await service.getPendingComments();
      expect(pendingComments).toHaveLength(0);
    });
  });

  describe("approveComment", () => {
    it("should approve a comment successfully", async () => {
      const postId = "test-post";
      const authorId = uuidv4();
      const content = "Test comment content";

      await db.insertInto("post").values({ id: postId }).execute();
      await db
        .insertInto("blogdans_user")
        .values({
          id: authorId,
          name: "Test User",
          email: "test@example.com",
          photo: "test-photo.jpg",
        })
        .execute();

      await service.insertComment(postId, authorId, content);

      const comments = await db.selectFrom("comment").selectAll().execute();
      const commentId = comments[0].id;

      const result = await service.approveComment(commentId);

      expect(result).toEqual({ success: true });

      // Verify the comment was approved
      const updatedComment = await db
        .selectFrom("comment")
        .selectAll()
        .where("id", "=", commentId)
        .executeTakeFirst();
      expect(updatedComment?.approved_at).not.toBeNull();
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment successfully", async () => {
      const postId = "test-post";
      const authorId = uuidv4();
      const content = "Test comment content";

      await db.insertInto("post").values({ id: postId }).execute();
      await db
        .insertInto("blogdans_user")
        .values({
          id: authorId,
          name: "Test User",
          email: "test@example.com",
          photo: "test-photo.jpg",
        })
        .execute();

      await service.insertComment(postId, authorId, content);

      const comments = await db.selectFrom("comment").selectAll().execute();
      const commentId = comments[0].id;

      const result = await service.deleteComment(commentId);

      expect(result).toEqual({ success: true });

      // Verify the comment was deleted
      const remainingComments = await db
        .selectFrom("comment")
        .selectAll()
        .execute();
      expect(remainingComments).toHaveLength(0);
    });
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();

      await db
        .insertInto("blogdans_user")
        .values([
          {
            id: userId1,
            name: "User One",
            email: "user1@example.com",
            photo: "photo1.jpg",
          },
          {
            id: userId2,
            name: "User Two",
            email: "user2@example.com",
            photo: "photo2.jpg",
          },
        ])
        .execute();

      const result = await service.getUsers(1, 10);

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it("should handle pagination correctly", async () => {
      const users = Array.from({ length: 15 }, (_, i) => ({
        id: uuidv4(),
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        photo: `photo${i + 1}.jpg`,
      }));

      await db.insertInto("blogdans_user").values(users).execute();

      const result = await service.getUsers(2, 10);

      expect(result.users).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(2);
    });
  });

  describe("syncPostToDatabase", () => {
    it("should sync a new post to database", async () => {
      const slug = "test-post-slug";

      await service.syncPostToDatabase(slug);

      const posts = await db.selectFrom("post").selectAll().execute();
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe(slug);
    });

    it("should not duplicate existing posts", async () => {
      const slug = "test-post-slug";

      await service.syncPostToDatabase(slug);
      await service.syncPostToDatabase(slug);

      const posts = await db.selectFrom("post").selectAll().execute();
      expect(posts).toHaveLength(1);
    });
  });
});
