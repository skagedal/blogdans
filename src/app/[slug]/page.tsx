import { notFound } from "next/navigation";
import type { Metadata } from "next";
import z from "zod";
import { getAllPages, getPage } from "@/lib/pages";
import { MarkdownPost } from "@/components/markdown-components";
import { Footer } from "@/components/footer";

/* Only the pages in content/pages live here; anything else is a 404. */
export const dynamicParams = false;

const paramsSchema = z.object({
  slug: z.string(),
});

interface ContentPageProps {
  params: Promise<z.infer<typeof paramsSchema>>;
}

export async function generateStaticParams() {
  const pages = await getAllPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata(
  props: ContentPageProps
): Promise<Metadata> {
  const { slug } = paramsSchema.parse(await props.params);
  const page = await getPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  const description = page.summary || `${page.title} on skagedal.tech`;

  return {
    title: `${page.title} | skagedal.tech`,
    description,
    openGraph: {
      type: "website",
      title: page.title,
      description,
      url: `/${page.slug}`,
    },
    twitter: {
      card: "summary",
      title: page.title,
      description,
    },
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = paramsSchema.parse(await params);
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <main className="mx-auto max-w-3xl flex-1 p-4">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {page.title}
            </h1>
          </header>
          <MarkdownPost content={page.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
