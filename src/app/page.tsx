import Link from "next/link";
import { format } from "date-fns";
import { getAllPosts } from "@/lib/posts";
import { Footer } from "@/components/footer";
import { H2, H3, Paragraph } from "@/components/typography";

export default async function BlogIndex() {
  const posts = await getAllPosts();
  return (
    <>
      <main className="mx-auto max-w-3xl flex-1 p-4">
        <div>
          <div className="max-w-none mb-8">
            <Paragraph>
              My name is Simon Kågedal Reimer, and I am a software engineer
              based in Uppsala, Sweden. This is my personal blog where I share
              my thoughts on software development, technology, and other topics
              that interest me.
            </Paragraph>
          </div>
          <section>
            <H2>Posts</H2>
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.slug}
                  className="border-b border-gray-200 pb-8 last:border-0"
                >
                  <H3>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </H3>
                  <time
                    className="text-sm text-gray-600"
                    dateTime={post.date.toISOString()}
                  >
                    {format(new Date(post.date), "MMMM d, yyyy")}
                  </time>
                  {post.summary && (
                    <Paragraph>{post.summary}</Paragraph>
                  )}
                </article>
              ))}
            </div>
          </section>{" "}
        </div>
      </main>
      <Footer />
    </>
  );
}
