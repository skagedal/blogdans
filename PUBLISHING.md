# Publishing checklist

After a post is live on skagedal.tech, verify the social media preview renders
correctly. Each blog post gets a dynamic 1200×630 OG image at
`/posts/<slug>/og`, plus full OpenGraph and Twitter Card metadata.

## Preview tools

Paste the post's URL (e.g. `https://skagedal.tech/posts/<slug>`) into one of
these to see how the link will render when shared.

### Multi-platform

- [opengraph.xyz](https://www.opengraph.xyz/) — side-by-side previews for
  Facebook, X/Twitter, LinkedIn, Discord. Best first stop.
- [metatags.io](https://metatags.io/) — similar, with live editing.

### Platform-specific (also force a cache refresh)

- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — shows
  what LinkedIn scraped and lets you re-fetch.
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) —
  good for catching general OG validation issues even if you don't post to
  Facebook.

### BlueSky

BlueSky has no official debugger. It uses its `cardyb` service — hit the
endpoint directly to see the JSON it would render from:

```
https://cardyb.bsky.app/v1/extract?url=https://skagedal.tech/posts/<slug>
```

### X / Twitter

The Card Validator was deprecated. Posting to a draft/private account is the
workaround.

## Notes

- Most platforms cache OG data aggressively. Use the "re-scrape" / "fetch new
  info" button after each change.
- Per-post `ogImage:` in frontmatter overrides the generated image.
