import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { config } from "@/config";

const postsDir = path.join(process.cwd(), "content", "posts");

const Front = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  ogImage: z.string().optional(),
});

export type Post = {
  title: string;
  date: Date;
  draft: boolean;
  summary: string;
  slug: string;
  tags?: string[];
  ogImage?: string;
};

export type PostComplete = Post & {
  content: string;
  previous?: Post;
  next?: Post;
};

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
    const { title, date: frontmatterDate, draft, summary, tags, ogImage } = Front.parse(data);
    const date = frontmatterDate ?? getDateFromSlug(slug);
    posts.push({
      title,
      date,
      draft: draft || false,
      summary: summary || "",
      slug,
      tags,
      ogImage,
    });
  }

  /* newest first, hide drafts unless SHOW_DRAFTS is enabled */
  return posts
    .filter((p) => config.showDrafts || !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getPost(slug: string): Promise<PostComplete> {
  const raw = await fs.readFile(path.join(postsDir, `${slug}.md`), "utf8");
  const { data, content } = matter(raw);
  const { title, date: frontmatterDate, draft, summary, tags, ogImage } = Front.parse(data);
  const date = frontmatterDate ?? getDateFromSlug(slug);

  // Build the current post
  const currentPost: PostComplete = {
    title,
    date,
    draft: draft || false,
    summary: summary || "",
    slug,
    tags,
    ogImage,
    content,
  };

  // Get all posts, filter out drafts and sort lexicographically by slug
  const allPosts = (await getAllPosts())
    .filter((p) => !p.draft)
    .sort((a, b) => a.slug.localeCompare(b.slug));

  // Find the index of the current post in the lex-sorted list
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  if (currentIndex !== -1) {
    if (currentIndex > 0) {
      currentPost.previous = allPosts[currentIndex - 1];
    }
    if (currentIndex < allPosts.length - 1) {
      currentPost.next = allPosts[currentIndex + 1];
    }
  }

  return currentPost;
}
