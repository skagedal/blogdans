import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <main className="prose mx-auto">
      <h1>Blog</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>{" "}
            {/* <time dateTime={p.date.toISOString()}>
              {p.date.toLocaleDateString()}
            </time> */}
          </li>
        ))}
      </ul>
    </main>
  );
}
