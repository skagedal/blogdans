import { Crimson_Pro } from "next/font/google";
import type { Metadata } from "next";
import "./splash.css";

export const metadata: Metadata = {
  title: "blogdans",
  description: "Simon's blog",
};

const crimson = Crimson_Pro({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-gray-100 ${crimson.className}`}>{children}</body>
    </html>
  );
}
