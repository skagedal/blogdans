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
    description: site.description,
    url: "/",
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Body>
        {children}
      </Body>
    </html>
  );
}
