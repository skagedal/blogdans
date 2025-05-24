import { getSite } from "@/lib/site";
import "./globals.css";
import type { Metadata } from "next";
import { Body } from "@/components/body";

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
      <Body>{children}</Body>
    </html>
  );
}
