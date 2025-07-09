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
  const screen = render(await BlogIndex())
  
  // Check that the main content is rendered
  expect(screen.getByRole('main')).toBeInTheDocument()
  
  // Check that the personal introduction is rendered
  expect(screen.getByText(/My name is Simon Kågedal Reimer/)).toBeInTheDocument()
  
  // Check that the Posts section is rendered
  expect(screen.getByRole('heading', { name: 'Posts' })).toBeInTheDocument()
  
  // Check that the mocked post is rendered
  expect(screen.getByRole('link', { name: 'Test Post' })).toBeInTheDocument()
  expect(screen.getByText('This is a test post summary')).toBeInTheDocument()
  
  // Check that the footer is rendered
  expect(screen.getByTestId('footer')).toBeInTheDocument()
})