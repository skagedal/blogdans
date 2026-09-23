import { describe, expect, test } from "vitest";
import { getAllPages, getNavPages, getPage } from "./pages";

describe("pages", () => {
  test("all pages in content/pages parse", async () => {
    const pages = await getAllPages();
    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(page.title).not.toBe("");
      expect(page.navTitle).not.toBe("");
    }
  });

  test("navigation is sorted by navOrder", async () => {
    const navPages = await getNavPages();
    const orders = navPages.map((page) => page.navOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(navPages.map((page) => page.navTitle)).toEqual(["About", "CV"]);
  });

  test("reads a page with its content", async () => {
    const page = await getPage("cv");
    expect(page?.title).toBe("Simon Kågedal Reimer: CV");
    expect(page?.navTitle).toBe("CV");
    expect(page?.content).toContain("## Experience");
  });

  test("pages in a subdirectory get a multi-segment slug", async () => {
    const slugs = (await getAllPages()).map((page) => page.slug);
    expect(slugs).toContain("tools/privacy");
    expect(slugs).toContain("tools/terms");
  });

  test("reads a page from a subdirectory", async () => {
    const page = await getPage("tools/privacy");
    expect(page?.title).toBe("skagedal-tools: Privacy policy");
    expect(page?.nav).toBe(false);
    expect(page?.content).toContain("one user");
  });

  test("pages with nav: false stay out of the navigation", async () => {
    const navSlugs = (await getNavPages()).map((page) => page.slug);
    expect(navSlugs).not.toContain("tools/privacy");
    expect(navSlugs).not.toContain("tools/terms");
  });

  test("unknown and malicious slugs return undefined", async () => {
    expect(await getPage("no-such-page")).toBeUndefined();
    expect(await getPage("../posts/2017-12-30-decimal-decoding")).toBeUndefined();
    expect(await getPage("tools/../../posts/2017-12-30-decimal-decoding")).toBeUndefined();
    expect(await getPage("/etc/passwd")).toBeUndefined();
    expect(await getPage("tools//privacy")).toBeUndefined();
  });
});
