import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPost, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { MarkdownPost } from "@/components/markdown-components";
import { Footer } from "@/components/footer";
import z from "zod";
import { Comments } from "@/components/comments/comments";

interface PostPageProps {
  params: Promise<any>;
  searchParams: Promise<any>;
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

const query = z.object({
  slug: z.string(),
  version: z.enum(['next', 'current']).optional().default('current'),
});

export default async function PostPage({ params, searchParams }: PostPageProps) {
  const { slug, version } = query.parse({
    ...await params,
    ...await searchParams
  });
  const post = await getPost(slug);

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
          <MarkdownPost content={post.content} />
          { version === 'next' && (<Comments />)} 
        </article>
      </main>
      <Footer previous={post.previous} next={post.next} />
    </>
  );
}
