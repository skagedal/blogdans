import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPost, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { MarkdownPost } from "@/components/markdown-components";
import { Footer } from "@/components/footer";
import z from "zod";
import { Comments } from "@/components/comments/comments";
import { DraftCard } from "@/components/draft";

const paramsSchema = z.object({
  slug: z.string(),
});

const searchParamsSchema = z.object({
  version: z.enum(["next", "current"]).optional().default("current"),
});

interface PostPageProps {
  params: Promise<z.infer<typeof paramsSchema>>;
  searchParams: Promise<z.infer<typeof searchParamsSchema>>;
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

export default async function PostPage({
  params,
  searchParams,
}: PostPageProps) {
  const { slug } = paramsSchema.parse(await params);
  const { version } = searchParamsSchema.parse(await searchParams);
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <main className="mx-auto max-w-3xl flex-1 p-4">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {post.title}
            </h1>
            <div className="text-sm text-muted-foreground space-y-1 mt-0">
              <time dateTime={post.date.toISOString()}>
                {format(new Date(post.date), "MMMM d, yyyy")}
              </time>
            </div>
          </header>
          {post.draft && <DraftCard />}
          <MarkdownPost content={post.content} />
          {version === "next" && <Comments />}
        </article>
      </main>
      <Footer previous={post.previous} next={post.next} />
    </>
  );
}
