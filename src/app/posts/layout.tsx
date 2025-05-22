import type { Metadata } from "next";

// Fix this: the intention was that the top screen would just use splash.css but that
// doesn't work.
// import "../globals.css";

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
          <p>&copy; 2025 Simon Kågedal Reimer</p>
        </footer>
      </article>
    </div>
  );
}
