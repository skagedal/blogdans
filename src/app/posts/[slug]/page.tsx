import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPost, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import Markdown from "react-markdown";
import { defaultSchema } from "rehype-sanitize";

// Note: I added rehype-raw and rehype-sanitize only to allow the iframe and figure tags
// used in some early blog posts. Would be neat if we could avoid this.
const schema = structuredClone(defaultSchema);
schema.tagNames!.push("iframe");
schema.tagNames!.push("figure");
schema.attributes!.iframe = [
  // keep the usual <iframe> attributes
  "src",
  "allow",
  "allowfullscreen",
  "loading",
  "title",
  "width",
  "height",
  "frameborder",
  "style",
];

import { markdownComponents } from "@/components/markdown-components";
import { Next, Prev } from "@/components/prev-next";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  props: PostPageProps
): Promise<Metadata> {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | skagedal.tech`,
    description: post.summary || `Read "${post.title}" on skagedal.tech`,
  };
}

export default async function PostPage(props: PostPageProps) {
  const params = await props.params;
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <main className="mx-auto max-w-3xl flex-1 p-4">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {post.title}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <time dateTime={post.date.toISOString()}>
                {format(new Date(post.date), "MMMM d, yyyy")}
              </time>
            </div>
          </header>

          <Markdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              rehypeRaw,
              [rehypeSanitize, schema],
              rehypeHighlight,
            ]}
          >
            {post.content}
          </Markdown>
        </article>
      </main>
      <footer className="mt-12 py-4 border-t border-gray-200 flex justify-between gap-4">
        {post.previousPost ? (
          <Prev url={post.previousPost.slug} title={post.previousPost.title} />
        ) : (
          <div className="w-1/2 max-w-xs" />
        )}
        {post.nextPost ? (
          <Next url={post.nextPost.slug} title={post.nextPost.title} />
        ) : (
          <div className="w-1/2 max-w-xs" />
        )}
      </footer>
    </>
  );
}
