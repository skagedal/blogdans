# Recording asciicasts for blog posts

Posts written as `.mdx` can embed live terminal recordings via the
`<Asciinema>` component. Recordings are made with
[asciinema](https://asciinema.org/) and stored as `.cast` files (asciicast
v2 JSON) under [`public/casts/`](public/casts/).

## Install asciinema

```sh
brew install asciinema
```

## Record

Recordings look best when they fit the post column on the page (about 80
columns) and don't carry over a lot of dead time. Both can be controlled
on the command line:

```sh
asciinema rec \
  --cols 100 --rows 28 \
  --idle-time-limit 1.5 \
  --command "log-viewer examples/sample.jsonl" \
  public/casts/log-viewer.cast
```

- `--cols` / `--rows` set the recorded terminal size; the player reuses
  these unless you override on the component.
- `--idle-time-limit 1.5` caps gaps between events at 1.5s — long pauses
  while you think don't end up baked in.
- `--command "..."` runs a single command and exits when it does, instead
  of dropping you into a shell.
- Drop `--command` and exit with `Ctrl-D` if you want a free-form session.

The `.cast` file is plain JSON (a metadata header followed by one event per
line) — small, diff-friendly, fine to check into git.

## Embed in a post

```mdx
<Asciinema
  src="/casts/log-viewer.cast"
  alt="Demo of log-viewer browsing JSONL logs from a kubectl stream."
/>
```

The `alt` text is required. It's used as the `aria-label` on the player
and as the fallback text in the RSS feed (where there's no JS runtime to
play the recording).

Optional props on `<Asciinema>`: `cols`, `rows`, `autoPlay`, `loop`,
`startAt`, `speed`, `idleTimeLimit`, `poster`, `theme`. They map directly
to [asciinema-player options](https://docs.asciinema.org/manual/player/options/).

## Iterate

```sh
pnpm dev
```

Then open the post page. Re-record by overwriting the `.cast` file —
the player picks up the new recording on the next reload.
