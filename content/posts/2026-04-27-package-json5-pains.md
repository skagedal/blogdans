---
layout: post
title: "The slow heartbreak of package.json5"
date: 2026-04-27
draft: true
summary: "Why I keep trying to use package.json5 for my Node tools, and why the JavaScript ecosystem keeps fighting me about it."
---

<!-- TODO: this draft is currently entirely LLM-generated. Rewrite in my own voice before publishing. -->

I have a small obsession that the JavaScript ecosystem does not approve of. I want my Node manifest file to allow comments and trailing commas, like every other ecosystem's manifest file does. So I keep trying to use `package.json5` instead of `package.json`. And I keep getting punished for it.

This post is partly an explainer of why this is harder than it should be, and partly a small flag I am planting in the ground for myself: I am going to keep trying.

## Why this should be uncontroversial

Compare these two snippets. Here is part of `Cargo.toml` from one of my Rust tools:

```toml
[dependencies]
# Pinned to 0.4 until we drop the deprecated `chrono::Local` calls.
chrono = "0.4"
clap = { version = "4", features = ["derive"] }
```

And here is the equivalent in `package.json`:

```json
{
  "dependencies": {
    "chrono": "0.4",
    "clap": "4"
  }
}
```

The Rust version tells you *why* chrono is pinned. The JSON version cannot, because JSON does not support comments. If you want to leave a note, your only options are:

- Put it in a separate `README` and hope the next person reads it.
- Smuggle it in as a `_comment` key, which is ugly and not idiomatic.
- Rename a dependency to something like `"_pin-reason-chrono": "see README"` — please don't.

This is a small papercut, but it bleeds every time I edit `package.json`. And every time I want to keep deps tidy with trailing commas, or write `name: "thing"` instead of `"name": "thing"`, the same papercut.

JSON5 fixes all of this. It is a strict superset of JSON that adds comments, trailing commas, unquoted keys (when they are valid identifiers), single-quoted strings, and a few other niceties. It is also a strict subset of valid JavaScript object literal syntax, which is a charming detail. So `package.json5` ought to be a drop-in replacement.

## What pnpm does, and what pnpm does not

The good news is that pnpm has *some* support for `package.json5`. If your project directory contains a `package.json5` and no `package.json`, `pnpm install` will read it, install the listed dependencies, and write a lockfile. So far so good.

The bad news is that the support is partial in a way that took me a few tries to nail down. Here is the matrix as far as I can tell from pnpm v10:

| Operation                  | Reads from `package.json5`? |
|----------------------------|:---------------------------:|
| `pnpm install` (resolve deps) | yes                      |
| `pnpm run <script>`           | **no — needs `package.json`** |
| Node loading `dist/` files (`type: "module"`) | no — needs `package.json` |
| `tsx src/index.ts` detecting ESM             | no — needs `package.json` |

So `pnpm install` works, and then `pnpm dev` immediately fails with `Command "dev" not found`, because pnpm went looking for the `scripts` block in `package.json` (which does not exist) instead of `package.json5` (which has it). Cute.

## The chicken and the egg

The natural workaround is: keep `package.json5` as the source of truth, generate `package.json` from it, and gitignore the generated copy. Lots of build systems do something like this. The problem is that there is no hook in pnpm that runs *before* it reads the manifest. The earliest user-defined code pnpm will run on your behalf is a `prepare` or `preinstall` script — which lives in the manifest. Which has not been read yet. Which is why you needed the script in the first place.

You can break the cycle in three ways, none of them great:

1. **Commit the generated `package.json` too.** Keep both files in git, sync them with a script you remember to run. The manifest is no longer "gitignored generated artifact"; it is "second copy I have to keep in sync." Better than nothing.
2. **Run a top-level setup script before any pnpm command.** This works for me — I already have a `./install` script at the root of my tools repo that iterates over each tool. But it means `cd ~/code/skagedal-tools/some-tool && pnpm install` does *not* work from a fresh clone, which feels wrong. Tools should be self-contained.
3. **Avoid needing `type: "module"` at all.** This is the rabbit hole I went down for a while.

## The `type: "module"` rabbit hole

Even if you solve the script-resolution problem, there is a second `package.json5` problem hiding behind it: Node and tsx ignore `package.json5` entirely when deciding whether a `.js` file is ESM or CommonJS. They look for `"type": "module"` in `package.json`, and only there.

For dist/ output this used to be fatal. Then Node 22.7 added automatic ESM detection for `.js` files, which means a freshly built `dist/index.js` with `import` statements at the top will load correctly even without a `type` field. So in modern Node, the dist side of the problem solves itself, as long as you stay on a recent enough runtime.

For dev via `tsx`, automatic detection does not help. `tsx` runs through esbuild, which does not auto-detect — esbuild defaults to CJS unless told otherwise, and CJS does not allow top-level `await`. So a perfectly normal entry point like

```ts
try {
  await cli(process.argv.slice(2), main, { ... });
} catch (err) {
  ...
}
```

fails immediately with `Top-level await is currently not supported with the "cjs" output format`. The fix that *works* is to give `tsx` a hint via the file extension: rename `src/index.ts` to `src/index.mts`, which forces ESM regardless of `package.json`. Then update all the imports of project-local files to use `.mjs` extensions (because `.mts` files use strict ESM resolution, and TypeScript wants the matching output extension), rename the rest of the source files to `.mts` too (because an ESM entry that imports CJS-treated `.ts` files cannot see named exports), update the `bin` field, update the test glob, and you are done. About ten minutes of work, no manifest gymnastics.

It only really works for projects that do not use JSX, though, because TypeScript does not have a `.mtsx` extension. So projects with React end up needing the manifest fix anyway.

## So why am I still doing this

The honest answer is: stubbornness, and the small daily pleasure of a manifest with comments. I think `package.json5` is a small feature that the JS ecosystem could have given itself fifteen years ago, and the friction I keep running into is not really about JSON5 — it is about a tooling stack that has settled on `package.json` as a hard contract, with too many independent consumers (npm, pnpm, yarn, Node, tsx, every bundler) for any one of them to relax it.

But I will keep planting small flags. JSON5 was right. Comments in config files are right. Trailing commas are right. And every time I edit a `package.json` and have to delete a comma or paste an explanatory comment somewhere else, I will know I was right.

Until then, my workflow is: keep `package.json5` as the source of truth, rename entry files to `.mts` for projects without JSX, and accept that the dist runtime will piggyback on Node's auto-detect. It is not a beautiful arrangement, but it lets me have my comments. Most of the time.
