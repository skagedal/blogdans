import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { Service } from "./service";
import { logger } from "@/logger";
import { db } from "@/db/client";

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
 */
export async function syncPostsToDatabase(): Promise<{ successCount: number, failureCount: number }> {
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
