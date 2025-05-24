import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { z } from 'zod'

const postsDir = path.join(process.cwd(), 'content', 'posts')

/* 1 – front-matter contract (type-safe) */
const Front = z.object({
  title:   z.string(),
  // date:    z.coerce.date(),
  draft:   z.boolean().optional().default(false),
  tags:    z.array(z.string()).optional(),
  summary: z.string().optional(),
})
export type Frontmatter = z.infer<typeof Front> & { slug: string }

/* 2 – helper to collect metadata for all posts */
export async function getAllPosts(): Promise<Frontmatter[]> {
  const files = await fs.readdir(postsDir)
  const posts: Frontmatter[] = []

  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const slug   = file.replace(/\.md$/, '')
    const raw    = await fs.readFile(path.join(postsDir, file), 'utf8')
    const { data } = matter(raw)
    const meta   = Front.parse(data)     // ⬅ zod validation
    posts.push({ ...meta, slug })
  }

  /* newest first, hide drafts */
  return posts;
    // .filter(p => !p.draft)
    // .sort((a, b) => b.date.getTime() - a.date.getTime())
}

/* 3 – helper to read one post */
export async function getPost(slug: string) {
  const raw            = await fs.readFile(path.join(postsDir, `${slug}.md`), 'utf8')
  const { data, content } = matter(raw)
  const meta = Front.parse(data)
  return { meta: { ...meta, slug }, content }
}