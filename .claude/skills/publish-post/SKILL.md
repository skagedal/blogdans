---
name: publish-post
description: Publish a draft blog post in content/posts/. Renames the file to today's date, sanity-checks the slug against the post's contents, validates title and summary in the frontmatter, and removes the `draft: true` flag. Use when the user asks to publish a post, ship a draft, or "make this post live".
---

# Publish a blog post

Use this skill when the user asks to publish a draft post in `content/posts/`.

## Inputs

- The target post. If the user did not specify which one, list the drafts (files in `content/posts/` with `draft: true` in their frontmatter) and ask which to publish. Do not guess.
- Today's date. Use the date provided in the session context (e.g. the `currentDate` reminder). If unavailable, run `date +%Y-%m-%d`.

## Post format reference

Posts live in `content/posts/` and are named `YYYY-MM-DD-slug.md`. The date in the filename is the canonical publish date — `src/lib/posts.ts` falls back to it when no `date:` is set in the frontmatter. Frontmatter looks like:

```yaml
---
layout: post
title: "Some title"
date: 2026-04-27        # optional; if present should match the filename date
draft: true             # remove this when publishing
summary: "One- or two-sentence summary."
---
```

The Zod schema in `src/lib/posts.ts` requires `title` and accepts optional `date`, `draft`, `tags`, `summary`.

## Steps

1. **Read the post.** Read the full file so you can judge whether the slug, title, and summary actually fit the contents.

2. **Decide the new slug.** The slug is the part of the filename after `YYYY-MM-DD-` and before `.md`. Check whether it accurately reflects the post's contents:
   - kebab-case, lowercase, ASCII letters/digits/hyphens only
   - short but descriptive (roughly 3–7 words)
   - reflects the topic, not just the title verbatim if the title is long
   
   If the existing slug is already a good fit, keep it. Otherwise propose a new slug and confirm with the user before renaming. Never silently change a slug — the slug is the URL.

3. **Sanity-check the frontmatter.**
   - `title`: present, non-empty, properly quoted, matches the post's actual subject. If it looks like a placeholder or doesn't fit the content, flag it and ask the user.
   - `summary`: present, non-empty, one to three sentences, accurately describes the post. If missing, weak, or stale relative to the content, propose a new summary and ask for confirmation.
   - Watch for editorial leftovers in the body — TODO comments, "draft" notes, `<!-- ... -->` reminders to rewrite, obvious placeholder text. Flag these to the user before publishing rather than ignoring them.

4. **Apply the changes.**
   - Edit the frontmatter: remove the `draft: true` line entirely. If a `date:` field is present, set it to today's date (or remove it and rely on the filename — match whatever the most recent published posts in this repo do; currently they tend to omit it once published, but keeping it is also fine — when in doubt, leave it and update it to today).
   - Update title/summary if the user agreed to changes.
   - Rename the file to `YYYY-MM-DD-<slug>.md` using today's date and the agreed slug. Use `git mv` so history is preserved:
     ```bash
     git mv content/posts/<old-name>.md content/posts/<new-name>.md
     ```
   - If the slug and date are unchanged, no rename is needed — just edit the file in place.

5. **Verify.** Run `pnpm tsc` is *not* needed (this is content, not code), but do:
   - `git status` to confirm the rename and edit landed as expected
   - `git diff --staged` (or `git diff HEAD`) to show the user the final frontmatter

6. **Stop there.** Do not commit or push unless the user asks. Report the new filename and a one-line summary of what changed.

## Notes

- If multiple drafts exist and the user is ambiguous, ask which one — don't publish more than one at a time.
- If the post's `date:` in frontmatter is in the future relative to today, that's fine to overwrite to today (publishing now).
- Don't reformat the body of the post. The skill's job is the filename and frontmatter, not editorial rewrites.
