import type { Metadata } from "next";
import "../globals.css";

// This is the root layout for the app. It wraps all pages in the app directory.

export const metadata: Metadata = {
  title: "blogdans",
  description: "Simon's blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="flex justify-center">
          <article className="max-w-2xl w-full px-4 py-8 shadow-md">
            <header className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Blog Post Title</h1>
              <p className="text-lg text-gray-600">Subtitle or brief description</p>
              <hr className="mt-4" />
            </header>
            <main>{children}</main>
            <footer className="mt-8">
              <hr className="mb-4" />
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Simon&apos;s blog
              </p>
            </footer>
          </article>
        </div>
      </body>
    </html>
  );
}
