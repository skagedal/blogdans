import { describe, expect, test } from "vitest";
import { markdownToHtml } from "./markdown-to-html";

describe("markdownToHtml", () => {
  test("replaces MDX components with their alt text", async () => {
    const html = await markdownToHtml(
      'Before\n\n<Asciinema src="/casts/x.cast" alt="A recording of x" />\n\nAfter',
      "mdx",
    );
    expect(html).toContain("<p>A recording of x</p>");
    expect(html).not.toContain("x.cast");
  });

  test("falls back to the component name without alt", async () => {
    const html = await markdownToHtml('<Asciinema src="/casts/x.cast" />', "mdx");
    expect(html).toContain("<p>[Asciinema]</p>");
  });

  test("renders plain markdown", async () => {
    const html = await markdownToHtml("Some *emphasis*", "md");
    expect(html).toBe("<p>Some <em>emphasis</em></p>");
  });
});
