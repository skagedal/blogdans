import Link from "next/link";

export function Header() {
  return (
    <header className="border-b backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-baseline justify-between p-4">
        <Link
          href="/"
          className="font-semibold tracking-tight hover:opacity-80"
        >
          skagedal.tech
        </Link>
      </nav>
    </header>
  );
}
