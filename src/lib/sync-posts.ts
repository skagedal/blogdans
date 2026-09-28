import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { Service } from "./service";
import { logger } from "@/logger";
import { db } from "@/db/client";
import { sql } from "kysely";
import { waitForDatabase } from "./wait-for-database";

const postsDir = path.join(process.cwd(), "content", "posts");

const Front = z.object({
  title: z.string(),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

/**
 * Syncs all posts from the filesystem to the database
 * Creates a record in the post table for each markdown file in content/posts
 *
 * Waits for the database to become reachable first: at node boot, the pod can
 * start before cluster DNS is up. Throws if it does not become reachable.
 */
export async function syncPostsToDatabase(): Promise<{ successCount: number, failureCount: number }> {
  await waitForDatabase(() => sql`select 1`.execute(db));
  const service = new Service(db);
  const files = await fs.readdir(postsDir);
  let successCount = 0;
  let failureCount = 0;

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const slug = file.replace(/\.md$/, "");
    const filePath = path.join(postsDir, file);

    try {
      const raw = await fs.readFile(filePath, "utf8");
      const { data } = matter(raw);

      Front.parse(data);

      await service.syncPostToDatabase(slug);
      successCount += 1;
    } catch (error) {
      logger.error(`Error processing post file ${file}:`, error);
      failureCount += 1;
    }
  }
  return { successCount, failureCount };
}
