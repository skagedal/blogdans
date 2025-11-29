# blogdans

This is the software that powers my blog, [skagedal.tech](https://skagedal.tech). 

## Development

Start the local infrastructure (database + migrations):

```shell
./local/start-infra
```

The database will listen on port 5433. 

Then run the development server:

```shell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Admin Setup

To access the admin panel ([http://localhost:3000/admin](/admin)), you need to grant admin privileges to a user. For local development with mock authentication:

1. Log in once with the "admin" user (username: `admin`) to create the user in the database
2. Grant admin role (password is "secret"):

```bash
psql -h localhost -p 5433 -U blogdans -d blogdans -c "INSERT INTO user_roles (user_id, role) VALUES ('00000000-0000-4000-8000-000000000001', 'admin');"
```

You'll have to delete your browser cookie (in Chrome: F12, Application tab, go to Cookies and clear). Then log in again.

## Configuration

The application is configured via environment variables:

### `SHOW_DRAFTS`

When set to `true`, draft posts will be displayed in the blog index with a "Draft" badge. By default, draft posts are hidden from the index.

```bash
SHOW_DRAFTS=true pnpm dev
```

Posts are marked as drafts using the `draft: true` frontmatter in the markdown files.

## Library choices

- To render Markdown, I use [react-markdown](https://github.com/remarkjs/react-markdown). In the future, I might dive deeper into this jungle of [remark](https://github.com/remarkjs/remark),  [react-remark](https://github.com/remarkjs/react-remark) and [rehype-react](https://github.com/rehypejs/rehype-react). I use remark-gfm to support the syntax I use from previous Jekyll setup. I don't use Next's mdx integration because I want more control over the rendering, but I might want to add some kind of MDX support later.
- Tailwind should be set up [like this](https://nextjs.org/docs/app/guides/tailwind-css). The LLM's lead me wrong. I should however take a look at what shadcn/ui does for Tailwind v4, as it seems quite different: https://ui.shadcn.com/docs/tailwind-v4 – it would be good to set up a "theme".
- Tailwind helpers like [tailwind-merge](https://www.npmjs.com/package/tailwind-merge), [clsx](https://www.npmjs.com/package/clsx), and [class-variance-authority](https://www.npmjs.com/package/class-variance-authority) are used to simplify class management. These are used because shadcn/ui recommends them, I would like to explore further into what they do and how they work.
- Similarly, some radix-ui components are used because shadcn. I would like to explore base-ui.com. 
- I use Lucide for general icons. I use react-icons for social icons.

## Database

- I use [dbmate](https://github.com/amacneil/dbmate) to handle database migrations. I mostly have experience with Flyway from before, and wanted something more lightweight.
