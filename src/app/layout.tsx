import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
