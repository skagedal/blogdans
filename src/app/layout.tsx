import type { Metadata } from "next";
import "./splash.css";

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
