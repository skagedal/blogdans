import Link from "next/link";
import React from "react";
import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { defaultSchema } from "rehype-sanitize";

// Note: I added rehype-raw and rehype-sanitize only to allow the iframe and figure tags
// used in some early blog posts. Would be neat if we could avoid this.
const schema = structuredClone(defaultSchema);
schema.tagNames!.push("iframe");
schema.tagNames!.push("figure");
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
  h1: (props) => (
    <h1 className="mt-12 mb-6 text-4xl font-bold tracking-tight" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-10 mb-5 text-3xl font-semibold" {...props} />
  ),
  h3: (props) => (
    <h3
      className="mt-8 mb-4 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h4: (props) => (
    <h4 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  h5: (props) => (
    <h5 className="mt-6 mb-3 text-lg font-semibold tracking-tight" {...props} />
  ),
  h6: (props) => (
    <h6
      className="mt-6 mb-2 text-base font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mb-4 leading-6 text-gray-800 dark:text-gray-200" {...props} />
  ),
  a: ({ href = "", children, ...props }) => (
    <Link
      href={href}
      className="text-blue-600 underline-offset-2 hover:underline"
      {...props}
    >
      {children}
    </Link>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc mb-4 ml-6 space-y-1" // bullets •••
      {...props}
    >
      {children}
    </ul>
  ),

  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal mb-4 ml-6 space-y-1" // 1. 2. 3.
      {...props}
    >
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="
          my-6 p-4 border-l-4 rounded-md pb-1
        bg-emerald-500/5    border-emerald-300/60  text-emerald-800
        dark:bg-emerald-400/10  dark:border-emerald-500/50  dark:text-emerald-300
        "
      {...props}
    >
      {children}
    </blockquote>
  ),
  hr: ({ ...props }) => (
    <hr
      className="my-8 border-t border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
  table: ({ children, ...props }) => (
    /* horizontal scroll on narrow screens */
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),

  thead: ({ children, ...props }) => (
    <thead
      className="border-b-2 border-slate-300 dark:border-slate-600"
      {...props}
    >
      {children}
    </thead>
  ),

  tbody: ({ children, ...props }) => (
    <tbody
      className="divide-y divide-slate-200 dark:divide-slate-700"
      {...props}
    >
      {children}
    </tbody>
  ),

  tr: ({ children, ...props }) => (
    /* zebra stripes every other row */
    <tr className="even:bg-slate-50 dark:even:bg-slate-800" {...props}>
      {children}
    </tr>
  ),

  th: ({ children, ...props }) => (
    <th
      className="whitespace-nowrap px-4 py-2 font-semibold text-slate-700 dark:text-slate-200"
      {...props}
    >
      {children}
    </th>
  ),

  td: ({ children, ...props }) => (
    <td className="whitespace-nowrap px-4 py-2" {...props}>
      {children}
    </td>
  ),
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
