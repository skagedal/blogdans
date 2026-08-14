import { render } from 'vitest-browser-react'
import { expect, test, vi } from 'vitest'
import ContentPage from './page'

// next/navigation needs a `process` global, which the browser test environment lacks
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound')
  },
}))

vi.mock('@/lib/pages', () => ({
  getAllPages: vi.fn(() => Promise.resolve([])),
  getPage: vi.fn(() =>
    Promise.resolve({
      slug: 'cv',
      title: 'Simon Kågedal Reimer: CV',
      navTitle: 'CV',
      navOrder: 2,
      nav: true,
      summary: 'A summary',
      content: '## Experience\n\n### Aira Home\n\n*2023 – present*\n',
    })
  ),
}))

// Mock the Footer component
vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

test('renders a markdown page', async () => {
  const screen = await render(
    await ContentPage({ params: Promise.resolve({ slug: 'cv' }) })
  )

  // The title comes from the frontmatter, not the markdown body
  await expect
    .element(screen.getByRole('heading', { level: 1, name: 'Simon Kågedal Reimer: CV' }))
    .toBeVisible()

  // The markdown body is rendered
  await expect
    .element(screen.getByRole('heading', { level: 2, name: 'Experience' }))
    .toBeVisible()
  await expect.element(screen.getByText('2023 – present')).toBeVisible()

  await expect.element(screen.getByTestId('footer')).toBeVisible()
})
