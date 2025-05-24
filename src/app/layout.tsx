import { getSite } from "@/lib/site";
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

const site = getSite();

/* -- global <head> metadata --------------------------------------------- */
export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s · {site.name}`,
  },
  description: site.description,
  authors: [{ name: "Simon Kågedal Reimer", url: "https://skagedal.tech" }],
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    title: site.name,
    url: "/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="border-b border-slate-200 bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
            <nav className="mx-auto flex max-w-3xl items-baseline justify-between p-4">
              <Link
                href="/"
                className="font-semibold tracking-tight hover:opacity-80"
              >
                skagedal.tech
              </Link>
              <Link
                href="/feed.xml"
                className="text-sm hover:underline hover:opacity-80"
              >
                RSS
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
