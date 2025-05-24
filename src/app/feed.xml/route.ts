import { getAllPosts } from "@/lib/posts";
import { getSite } from "@/lib/site";

const site = getSite();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllPosts();

  const items = posts
    .filter((p) => !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)
    .map((post) => {
      const url = `${site.url}/posts/${escapeXml(post.slug)}/`;
      return `
        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${url}</link>
            <description>${escapeXml(post.summary)}</description>
            <pubDate>${post.date.toUTCString()}</pubDate>
            <guid isPermaLink="true">${url}</guid>
        </item>`;
    });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
<channel>
    <title>skagedal.tech</title>
    <description>${escapeXml(site.description)}</description>
    <link>${escapeXml(site.url)}</link>
    <atom:link href="https://blog.skagedal.tech/feed.xml" rel="self" type="application/rss+xml"/>
    <pubDate>Sat, 24 May 2025 10:46:43 +0000</pubDate>
    <lastBuildDate>Sat, 24 May 2025 10:46:43 +0000</lastBuildDate>
    <generator>skagedal.tech</generator>
${items.join("\n")}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml" },
  });
}
