import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { visit, SKIP } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Paragraph, Text } from 'mdast';
import type { PostFormat } from './posts';

/**
 * For MDX content rendered into static HTML (RSS feeds, OG previews, etc.),
 * we don't have a JS runtime to play interactive widgets. Replace each MDX
 * JSX node with a paragraph containing its `alt` attribute — same idea as
 * `alt` on an `<img>`. Falls back to `[<ComponentName>]` if no alt is given.
 */
const replaceMdxJsxWithAlt: Plugin<[], Root> = () => (tree) => {
  visit(tree, (node, index, parent) => {
    if (
      (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') ||
      !parent ||
      typeof index !== 'number'
    ) {
      return;
    }
    // Narrow: mdxJsxFlowElement / mdxJsxTextElement carry { name, attributes }.
    const jsx = node as unknown as {
      name: string | null;
      attributes: Array<{
        type: string;
        name?: string;
        value?: string | { value?: string } | null;
      }>;
    };
    const altAttr = jsx.attributes.find(
      (a) => a.type === 'mdxJsxAttribute' && a.name === 'alt',
    );
    let alt: string | undefined;
    if (altAttr) {
      if (typeof altAttr.value === 'string') {
        alt = altAttr.value;
      } else if (altAttr.value && typeof altAttr.value === 'object' && typeof altAttr.value.value === 'string') {
        alt = altAttr.value.value;
      }
    }
    const fallback = `[${jsx.name ?? 'embedded widget'}]`;
    const text: Text = { type: 'text', value: alt ?? fallback };
    const replacement: Paragraph = { type: 'paragraph', children: [text] };
    parent.children.splice(index, 1, replacement);
    return [SKIP, index + 1];
  });
};

/**
 * Converts post content to HTML for non-React contexts (RSS feed).
 * MDX JSX widgets are replaced with their `alt` text.
 */
export async function markdownToHtml(
  content: string,
  format: PostFormat = 'md',
): Promise<string> {
  const processor = unified().use(remarkParse).use(remarkGfm);

  if (format === 'mdx') {
    processor.use(remarkMdx).use(replaceMdxJsxWithAlt);
  }

  const result = await processor
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return String(result);
}
