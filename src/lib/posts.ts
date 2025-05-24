import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const postsDir = path.join(process.cwd(), "content", "posts");

const Front = z.object({
  title: z.string(),
  // Do we ever want to allow date to be set manually?
  // date: z.string().optional(), 
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

export type Post = {
  title: string;
  date: Date ;
  draft: boolean;
  summary: string;
  slug: string;
} 

export type PostComplete = Post & {
  content: string;
}

/**
 * Extracts the date from the slug
 */
function getDateFromSlug(slug: string): Date {
  const parts = slug.split("-");
  if (parts.length < 3) {
    throw new Error(`Invalid file name format: ${slug}`);
  }
  return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
}

/**
 * @returns Metadata for all posts
 */
export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(postsDir);
  const posts: Post[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const slug = file.replace(/\.md$/, "");
    const raw = await fs.readFile(path.join(postsDir, file), "utf8");
    const { data } = matter(raw);
    const { title, draft, summary} = Front.parse(data);
    const date = getDateFromSlug(slug);
    posts.push({ 
      title,
      date,
      draft: draft || false,
      summary: summary || "",
      slug,
     });
  }

  /* newest first, hide drafts */
  return posts
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getPost(slug: string) {
  const raw = await fs.readFile(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const { title, draft, summary}  = Front.parse(data);
  const fileDate = getDateFromSlug(slug);
  return { 
    title,
    date: fileDate,
    draft: draft || false,
    summary: summary || "",
    slug,
    content,
   };
}
