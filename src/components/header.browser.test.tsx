import { render } from 'vitest-browser-react'
import { expect, test, vi } from 'vitest'
import { Header } from './header'

// next/link needs a `process` global, which the browser test environment lacks
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock('@/lib/pages', () => ({
  getNavPages: vi.fn(() =>
    Promise.resolve([
      { slug: 'about', title: 'About', navTitle: 'About', navOrder: 1, nav: true, summary: '' },
      { slug: 'cv', title: 'CV', navTitle: 'CV', navOrder: 2, nav: true, summary: '' },
    ])
  ),
}))

test('renders links to the navigation pages', async () => {
  const screen = await render(await Header())

  await expect.element(screen.getByRole('link', { name: /skagedal.tech/ })).toBeVisible()

  const about = screen.getByRole('link', { name: 'About' })
  await expect.element(about).toBeVisible()
  await expect.element(about).toHaveAttribute('href', '/about')

  const cv = screen.getByRole('link', { name: 'CV' })
  await expect.element(cv).toBeVisible()
  await expect.element(cv).toHaveAttribute('href', '/cv')

  // The hamburger is present for narrow viewports (hidden by CSS on wide ones)
  await expect.element(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
})
