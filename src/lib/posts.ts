import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { config } from "@/config";

const postsDir = path.join(process.cwd(), "content", "posts");

export type PostFormat = "md" | "mdx";

const Front = z.object({
  title: z.string(),
  date: z.coerce.date().optional(),
  draft: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  ogImage: z.string().optional(),
  hackernews: z.string().url().optional(),
  bluesky: z.string().url().optional(),
  linkedin: z.string().url().optional(),
});

export type Post = {
  title: string;
  date: Date;
  draft: boolean;
  summary: string;
  slug: string;
  format: PostFormat;
  tags?: string[];
  ogImage?: string;
  hackernews?: string;
  bluesky?: string;
  linkedin?: string;
};

export type PostComplete = Post & {
  content: string;
  previous?: Post;
  next?: Post;
};

function getDateFromSlug(slug: string): Date {
  const parts = slug.split("-");
  if (parts.length < 3) {
    throw new Error(`Invalid file name format: ${slug}`);
  }
  return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
}

function parseFile(file: string): { slug: string; format: PostFormat } | null {
  if (file.endsWith(".mdx")) return { slug: file.replace(/\.mdx$/, ""), format: "mdx" };
  if (file.endsWith(".md")) return { slug: file.replace(/\.md$/, ""), format: "md" };
  return null;
}

async function findPostFile(slug: string): Promise<{ filePath: string; format: PostFormat } | null> {
  const mdxPath = path.join(postsDir, `${slug}.mdx`);
  try {
    await fs.access(mdxPath);
    return { filePath: mdxPath, format: "mdx" };
  } catch {
    // fall through
  }
  const mdPath = path.join(postsDir, `${slug}.md`);
  try {
    await fs.access(mdPath);
    return { filePath: mdPath, format: "md" };
  } catch {
    return null;
  }
}

/**
 * @returns Metadata for all posts
 */
export async function getAllPosts(): Promise<Post[]> {
  const files = await fs.readdir(postsDir);
  const posts: Post[] = [];
  const seen = new Set<string>();

  // Sort so .mdx wins over .md if both exist for the same slug
  const sorted = [...files].sort((a, b) => (a.endsWith(".mdx") ? -1 : b.endsWith(".mdx") ? 1 : 0));

  for (const file of sorted) {
    const parsed = parseFile(file);
    if (!parsed) continue;
    if (seen.has(parsed.slug)) continue;
    seen.add(parsed.slug);

    const raw = await fs.readFile(path.join(postsDir, file), "utf8");
    const { data } = matter(raw);
    const { title, date: frontmatterDate, draft, summary, tags, ogImage, hackernews, bluesky, linkedin } = Front.parse(data);
    const date = frontmatterDate ?? getDateFromSlug(parsed.slug);
    posts.push({
      title,
      date,
      draft: draft || false,
      summary: summary || "",
      slug: parsed.slug,
      format: parsed.format,
      tags,
      ogImage,
      hackernews,
      bluesky,
      linkedin,
    });
  }

  /* newest first, hide drafts unless SHOW_DRAFTS is enabled */
  return posts
    .filter((p) => config.showDrafts || !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getPost(slug: string): Promise<PostComplete> {
  const found = await findPostFile(slug);
  if (!found) {
    throw new Error(`Post not found: ${slug}`);
  }
  const raw = await fs.readFile(found.filePath, "utf8");
  const { data, content } = matter(raw);
  const { title, date: frontmatterDate, draft, summary, tags, ogImage, hackernews, bluesky, linkedin } = Front.parse(data);
  const date = frontmatterDate ?? getDateFromSlug(slug);

  // Build the current post
  const currentPost: PostComplete = {
    title,
    date,
    draft: draft || false,
    summary: summary || "",
    slug,
    format: found.format,
    tags,
    ogImage,
    hackernews,
    bluesky,
    linkedin,
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
