import React from "react";
import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "rehype-sanitize";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  Paragraph,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Anchor,
  UnorderedList,
  OrderedList,
  ListElement,
  BlockQuote,
  HorizontalRule,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderRow,
  TableCell,
} from "./ui/typography";
import { Asciinema } from "./asciinema";

// Note: I added rehype-raw and rehype-sanitize only to allow the iframe and figure tags
// used in some early blog posts. Would be neat if we could avoid this.
const schema = structuredClone(defaultSchema);
schema.tagNames!.push("iframe");
schema.tagNames!.push("figure");
// Disable clobberPrefix - remark-gfm already adds user-content- prefix to footnote IDs,
// and having rehype-sanitize add it again breaks footnote anchor links.
schema.clobberPrefix = "";
schema.attributes!.iframe = [
  // keep the usual <iframe> attributes
  "src",
  "allow",
  "allowfullscreen",
  "loading",
  "title",
  "width",
  "height",
  "frameborder",
  "style",
];

export const markdownComponents: Components = {
  h1: (props) => <H1 {...props} />,
  h2: (props) => <H2 {...props} />,
  h3: (props) => <H3 {...props} />,
  h4: (props) => <H4 {...props} />,
  h5: (props) => <H5 {...props} />,
  h6: (props) => <H6 {...props} />,
  p: (props) => <Paragraph {...props} />,
  a: ({ href = "", ...props }) => <Anchor href={href} {...props} />,
  ul: (props) => <UnorderedList {...props} />,
  ol: (props) => <OrderedList {...props} />,
  li: (props) => <ListElement {...props} />,
  blockquote: (props) => <BlockQuote {...props} />,
  hr: (props) => <HorizontalRule {...props} />,
  table: (props) => <Table {...props} />,
  thead: (props) => <TableHead {...props} />,
  tbody: (props) => <TableBody {...props} />,
  tr: (props) => <TableRow {...props} />,
  th: (props) => <TableHeaderRow {...props} />,
  td: (props) => <TableCell {...props} />,
};

export function MarkdownPost({ content }: { content: string }) {
  return (
    <Markdown
      components={markdownComponents}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], rehypeHighlight]}
    >
      {content}
    </Markdown>
  );
}

// MDX content is authored in this repo and trusted, so we don't run
// rehype-sanitize. Safety comes from the component allowlist below — anything
// not listed renders as a plain HTML element with no extra capabilities.
const mdxComponents = {
  ...markdownComponents,
  Asciinema,
};

export function MdxPost({ content }: { content: string }) {
  return (
    <MDXRemote
      source={content}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypeHighlight],
        },
      }}
    />
  );
}
