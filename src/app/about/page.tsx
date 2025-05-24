import { markdownComponents } from "@/components/markdown-components";
import Markdown from "react-markdown";

export default async function AboutPage() {
  return (
    <article>
      <Markdown components={markdownComponents}>
        {`
# Markdown Example
This is a simple markdown example.
## Subheading
Here is some code:
`}
      </Markdown>
    </article>
  );
}
