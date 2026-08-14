import Link from "next/link";
import { getNavPages } from "@/lib/pages";
import { MobileNav } from "./mobile-nav";

export async function Header() {
  const pages = await getNavPages();

  return (
    <header className="border-b backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-baseline justify-between p-4">
        <Link
          href="/"
          className="font-semibold tracking-tight hover:opacity-80"
        >
          skagedal.tech <span aria-hidden="true">✨</span>
        </Link>
        {pages.length > 0 && (
          <>
            <ul className="hidden sm:flex items-baseline gap-4">
              {pages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {page.navTitle}
                  </Link>
                </li>
              ))}
            </ul>
            <MobileNav
              pages={pages.map(({ slug, navTitle }) => ({ slug, navTitle }))}
            />
          </>
        )}
      </nav>
    </header>
  );
}
