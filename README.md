# blogdans

This is the software that powers my blog, [skagedal.tech](https://skagedal.tech). 

## Development

First, run the development server:

```shell
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Library choices

- To render Markdown, I use [react-markdown](https://github.com/remarkjs/react-markdown). In the future, I might dive deeper into this jungle of [remark](https://github.com/remarkjs/remark),  [react-remark](https://github.com/remarkjs/react-remark) and [rehype-react](https://github.com/rehypejs/rehype-react). I use remark-gfm to support the syntax I use from previous Jekyll setup. I don't use Next's mdx integration because I want more control over the rendering, but I might want to add some kind of MDX support later.
- Tailwind should be set up [like this](https://nextjs.org/docs/app/guides/tailwind-css). The LLM's lead me wrong.
- I use Lucide for general icons. I use react-icons for social icons.