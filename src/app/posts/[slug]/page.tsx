import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPost, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Markdown from "react-markdown";
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
        rehypePlugins={[rehypeHighlight]}
      >
        {post.content}
      </Markdown>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to all posts
        </a>
      </footer>
    </article>
  );
}
