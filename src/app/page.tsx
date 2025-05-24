import Link from "next/link";
import { format } from "date-fns";
import { getAllPosts } from "@/lib/posts";

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (<>
              
          <main className="mx-auto max-w-3xl flex-1 p-4">

    <div>
      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-gray-600">
          My name is Simon Kågedal Reimer, and I am a software engineer based in
          Uppsala, Sweden. This is my personal blog where I share my thoughts on
          software development, technology, and other topics that interest me.
        </p>
      </div>
      <section>
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        <div className="space-y-8">
          {posts.length === 0 ? (
            <p className="text-gray-600">
              No posts found. Add markdown files to the content/posts directory.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-gray-200 pb-8 last:border-0"
              >
                <h3 className="text-xl font-semibold mb-2">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h3>
                <time className="text-sm text-gray-600" dateTime={post.date.toISOString()}>
                  {format(new Date(post.date), "MMMM d, yyyy")}
                </time>
                {post.summary && (
                  <p className="mt-2 text-gray-700">{post.summary}</p>
                )}
                
              </article>
            ))
          )}
        </div>
      </section>{" "}
    </div>
    </main>

          <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
            © {new Date().getFullYear()} Simon Kågedal Reimer.
          </footer>
            </>

  );
}
