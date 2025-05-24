# blogdans

The Next.js version.

## Development

First, run the development server:

```shell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Library choices

- To parse Markdown, I use remark. As a first step, I want to move easily from my Jekyll setup. I don't use Next's mdx integration because I want more control over the rendering.
- Tailwind should be set up [like this](https://nextjs.org/docs/app/guides/tailwind-css). The LLM's lead me wrong.
- I use Lucide for general icons. I use react-icons for social icons.