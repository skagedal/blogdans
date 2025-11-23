import { render } from 'vitest-browser-react'
import { expect, test, vi } from 'vitest'
import BlogIndex from './page'

// Mock the getAllPosts function
vi.mock('@/lib/posts', () => ({
  getAllPosts: vi.fn(() => Promise.resolve([
    {
      slug: 'test-post',
      title: 'Test Post',
      date: new Date('2023-01-01'),
      summary: 'This is a test post summary',
    },
  ])),
}))

// Mock the Footer component
vi.mock('@/components/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}))

test('renders the index page', async () => {
  const screen = await render(await BlogIndex())

  // Check that the main content is rendered
  await expect.element(screen.getByRole('main')).toBeVisible()

  // Check that the personal introduction is rendered
  await expect.element(screen.getByText(/My name is Simon Kågedal Reimer/)).toBeVisible()

  // Check that the Posts section is rendered
  await expect.element(screen.getByRole('heading', { name: 'Posts' })).toBeVisible()

  // Check that the mocked post is rendered
  await expect.element(screen.getByRole('link', { name: 'Test Post' })).toBeVisible()
  await expect.element(screen.getByText('This is a test post summary')).toBeVisible()

  // Check that the footer is rendered
  await expect.element(screen.getByTestId('footer')).toBeVisible()
})