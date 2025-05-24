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
  p: ({ node, ...props }) => (
    <p className="mb-4 leading-7 text-gray-800 dark:text-gray-200" {...props} />
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
};
