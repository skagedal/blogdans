import Link from "next/link";
import React from "react";
import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  h1: ({ node, ...props }) => (
    <h1 className="mt-12 mb-6 text-4xl font-bold tracking-tight" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="mt-10 mb-5 text-3xl font-semibold" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3
      className="mt-8 mb-4 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h4: ({ node, ...props }) => (
    <h4 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  h5: ({ node, ...props }) => (
    <h5 className="mt-6 mb-3 text-lg font-semibold tracking-tight" {...props} />
  ),
  h6: ({ node, ...props }) => (
    <h6
      className="mt-6 mb-2 text-base font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400"
      {...props}
    />
  ),
  p: ({ node, ...props }) => (
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
      className="my-6 border-l-4 border-slate-300 pl-4 italic text-slate-700 dark:border-slate-600 dark:text-slate-300"
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
};
