import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { Service } from "./service";
import { logger } from "@/logger";

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
export async function syncPostsToDatabase(): Promise<void> {
  try {
    logger.info("Starting post synchronization to database");
    
    const service = new Service();
    const files = await fs.readdir(postsDir);
    const postSlugs: string[] = [];

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      
      const slug = file.replace(/\.md$/, "");
      const filePath = path.join(postsDir, file);
      
      try {
        const raw = await fs.readFile(filePath, "utf8");
        const { data } = matter(raw);
        
        // Validate frontmatter to ensure it's a valid post
        Front.parse(data);
        
        postSlugs.push(slug);
        
        // Insert or update the post record via service
        await service.syncPostToDatabase(slug);
          
      } catch (error) {
        logger.error(`Error processing post file ${file}:`, error);
      }
    }
    
    logger.info(`Successfully synchronized ${postSlugs.length} posts to database`);
    
  } catch (error) {
    logger.error("Failed to sync posts to database:", error);
    throw error;
  }
}