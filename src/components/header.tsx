import Link from "next/link";

export function Header() {
  return (
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
  );
}
