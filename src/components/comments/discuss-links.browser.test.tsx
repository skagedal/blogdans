import { render } from 'vitest-browser-react'
import { expect, test } from 'vitest'
import { DiscussLinks } from './discuss-links'

test('joins three links with a comma and "or"', async () => {
  const screen = await render(
    <DiscussLinks hackernews="https://hn.example" bluesky="https://bsky.example" linkedin="https://li.example" />
  )

  await expect.element(screen.getByText(/Discuss this post on/)).toHaveTextContent(
    'Discuss this post on Hacker News, Blue Sky or Linked In.'
  )
  await expect.element(screen.getByRole('link', { name: 'Blue Sky' })).toHaveAttribute('href', 'https://bsky.example')
})

test('joins two links with "or"', async () => {
  const screen = await render(<DiscussLinks hackernews="https://hn.example" linkedin="https://li.example" />)

  await expect.element(screen.getByText(/Discuss this post on/)).toHaveTextContent(
    'Discuss this post on Hacker News or Linked In.'
  )
})

test('renders nothing without links', async () => {
  const screen = await render(<DiscussLinks />)

  expect(screen.container.textContent).toBe('')
})
