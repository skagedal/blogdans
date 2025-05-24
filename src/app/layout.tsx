import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

/* -- global <head> metadata --------------------------------------------- */
export const metadata: Metadata = {
  title: {
    default: 'My Blog',
    template: '%s · My Blog',
  },
  description: 'Personal thoughts and notes on web development.',
  authors: [{ name: 'Your Name', url: 'https://example.com' }],
  metadataBase: new URL('https://example.com'),
  openGraph: {
    type: 'website',
    title: 'My Blog',
    url: '/',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* dark-mode toggle is purely CSS (prefers-color-scheme) */}
      <body className="min-h-screen bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
        {/* --- site header / nav ---------------------------------------- */}
        <header className="border-b border-slate-200 bg-white/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <nav className="mx-auto flex max-w-4xl items-baseline justify-between p-4">
            <Link
              href="/"
              className="font-semibold tracking-tight hover:opacity-80"
            >
              My&nbsp;Blog
            </Link>
            <Link
              href="/feed.xml"
              className="text-sm hover:underline hover:opacity-80"
            >
              RSS
            </Link>
          </nav>
        </header>

        {/* --- page content --------------------------------------------- */}
        <main className="mx-auto max-w-3xl flex-1 p-4">{children}</main>

        {/* --- footer ---------------------------------------------------- */}
        <footer className="border-t border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">
          © {new Date().getFullYear()} Your Name. All rights reserved.
        </footer>
      </body>
    </html>
  )
}