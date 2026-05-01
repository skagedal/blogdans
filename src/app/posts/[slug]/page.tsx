import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getPost, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { MarkdownPost } from "@/components/markdown-components";
import { Footer } from "@/components/footer";
import z from "zod";
import { Comments } from "@/components/comments/comments";
import { DraftCard } from "@/components/draft";
import { FeatureManagementSearchParams, getFeatures } from "@/lib/feature-management";

const paramsSchema = z.object({
  slug: z.string(),
});

interface PostPageProps {
  params: Promise<z.infer<typeof paramsSchema>>;
  searchParams: Promise<FeatureManagementSearchParams>;
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

  const description = post.summary || `Read "${post.title}" on skagedal.tech`;
  const ogImageUrl = post.ogImage ?? `/posts/${post.slug}/og`;

  return {
    title: `${post.title} | skagedal.tech`,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/posts/${post.slug}`,
      publishedTime: post.date.toISOString(),
      authors: ["Simon Kågedal Reimer"],
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: PostPageProps) {
  const { slug } = paramsSchema.parse(await params);
  const { showComments } = await getFeatures(await searchParams);
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
          {showComments && <Comments pageId={slug} />}
        </article>
      </main>
      <Footer previous={post.previous} next={post.next} />
    </>
  );
}
