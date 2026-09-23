import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const pagesDir = path.join(process.cwd(), "content", "pages");

/**
 * Slugs come straight from the URL, so keep them boring. A slug may have
 * several segments — `content/pages/tools/privacy.md` is `/tools/privacy` —
 * and since each segment is lowercase letters, digits and hyphens only, a
 * slug can never climb out of content/pages.
 */
const segment = "[a-z0-9]+(?:-[a-z0-9]+)*";
const slugPattern = new RegExp(`^${segment}(?:/${segment})*$`);

const Front = z.object({
  title: z.string(),
  /* Shown in the site navigation; defaults to the title. */
  navTitle: z.string().optional(),
  /* Lower numbers come first in the navigation. */
  navOrder: z.number().optional().default(0),
  /* Set to false to keep the page out of the navigation. */
  nav: z.boolean().optional().default(true),
  summary: z.string().optional(),
});

export type Page = {
  slug: string;
  title: string;
  navTitle: string;
  navOrder: number;
  nav: boolean;
  summary: string;
};

export type PageComplete = Page & {
  content: string;
};

function toPage(slug: string, data: unknown): Page {
  const { title, navTitle, navOrder, nav, summary } = Front.parse(data);
  return {
    slug,
    title,
    navTitle: navTitle ?? title,
    navOrder,
    nav,
    summary: summary || "",
  };
}

function byNavOrderThenTitle(a: Page, b: Page): number {
  return a.navOrder - b.navOrder || a.navTitle.localeCompare(b.navTitle);
}

/**
 * @returns Metadata for all pages
 */
export async function getAllPages(): Promise<Page[]> {
  const pages: Page[] = [];

  async function walk(dir: string, prefix: string): Promise<void> {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const next = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(dir, entry.name), next);
      } else if (entry.name.endsWith(".md")) {
        const slug = next.replace(/\.md$/, "");
        const raw = await fs.readFile(path.join(dir, entry.name), "utf8");
        const { data } = matter(raw);
        pages.push(toPage(slug, data));
      }
    }
  }

  await walk(pagesDir, "");
  return pages.sort(byNavOrderThenTitle);
}

/**
 * @returns The pages that should show up in the site navigation
 */
export async function getNavPages(): Promise<Page[]> {
  return (await getAllPages()).filter((page) => page.nav);
}

/**
 * @returns The page, or undefined if there is no such page
 */
export async function getPage(slug: string): Promise<PageComplete | undefined> {
  if (!slugPattern.test(slug)) {
    return undefined;
  }
  let raw: string;
  try {
    raw = await fs.readFile(path.join(pagesDir, `${slug}.md`), "utf8");
  } catch {
    return undefined;
  }
  const { data, content } = matter(raw);
  return { ...toPage(slug, data), content };
}
