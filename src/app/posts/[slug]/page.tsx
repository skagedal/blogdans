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
    <article>
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          <time dateTime={post.date.toISOString()}>
            {format(new Date(post.date), "MMMM d, yyyy")}
          </time>
        </div>
      </header>

      <Markdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeHighlight]}
      >
        {post.content}
      </Markdown>

      <footer className="mt-12 pt-8 border-t border-gray-200 flex justify-between gap-4">
        {post.previousPost ? (
          <a
            href={`/posts/${post.previousPost.slug}`}
            className="flex items-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 text-gray-800 no-underline min-h-[56px]"
            style={{ justifyContent: 'flex-start' }}
          >
            <span className="mr-2 flex-shrink-0" aria-label="Previous post">
              {/* Left arrow SVG */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M13 16l-5-6 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="break-words whitespace-normal">{post.previousPost.title}</span>
          </a>
        ) : <div className="w-1/2 max-w-xs" />}
        {post.nextPost ? (
          <a
            href={`/posts/${post.nextPost.slug}`}
            className="flex items-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-3 w-1/2 max-w-xs mb-0 text-gray-800 no-underline justify-end min-h-[56px]"
            style={{ justifyContent: 'flex-end' }}
          >
            <span className="break-words whitespace-normal mr-2 text-right">{post.nextPost.title}</span>
            <span className="flex-shrink-0" aria-label="Next post">
              {/* Right arrow SVG */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 4l5 6-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </a>
        ) : <div className="w-1/2 max-w-xs" />}
      </footer>
    </article>
  );
}
