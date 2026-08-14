# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
pnpm dev              # Start development server 
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db               # Generate TypeScript types from database schema
dbmate up             # Run database migrations
dbmate new <name>     # Create new migration
```

## Architecture Overview

This is a Next.js blog application for skagedal.tech with App Router, featuring:

### Content System
- **Markdown blog posts** stored in `/content/posts/` with frontmatter
- **Filename-based dating**: Posts follow `YYYY-MM-DD-slug.md` convention
- **Draft support**: Posts can be marked as drafts in frontmatter
- **Navigation**: Chronological ordering with prev/next links
- **Standalone pages** stored in `/content/pages/` (e.g. About, CV), served at `/<slug>`
  by `src/app/[slug]/page.tsx`. Frontmatter: `title`, optional `navTitle`, `navOrder`
  (menu order), `nav: false` (hide from menu) and `summary`. Adding a markdown file
  there is enough to get a page and a menu entry.

### Database Design
Uses PostgreSQL with Kysely query builder and a normalized schema:
- `blogdans_user` + `google_user` tables for dual identity model
- `post` table where `id` is the slug
- `comment` table with moderation via `approved_at` field
- Auto-updating timestamps via database triggers

### Authentication
- **Better Auth** with Google OAuth
- **Profile model**: `blogdans_user` is a slim profile table joined to Better Auth's `user` table by id
- **Local dev**: real Google OAuth (or email+password once PR 2 lands)

### Key Technologies
- **tRPC v11** for type-safe APIs with superjson transformer
- **TanStack Query** for data fetching
- **Zod** for runtime validation
- **Tailwind CSS** with shadcn/ui components
- **React Markdown** with syntax highlighting and GFM support

### Database Connection
Supports flexible configuration:
- Single `DATABASE_URL` or component-based config
- SSL mode for production
- Password file support for secure credentials

### Comment System
- Form at `/src/components/comments/comment-form.tsx`
- API endpoint at `/src/app/api/posts/[slug]/comment/route.ts`
- Moderation workflow (comments need approval to display)
- Login required to comment

## Configuration
- App is configured via environment variables, read in `/src/config.ts`
- New features under development should be toggled with feature flags in config

## Development Notes

- **Type checking**: Run `pnpm tsc` to check that types are correct
- **Type generation**: Run `pnpm db` after database schema changes to update TypeScript types
- **Content**: Add new posts to `/content/posts/` following the date-slug naming convention
- **Styling**: Uses shadcn/ui components with Tailwind CSS helpers (tailwind-merge, clsx, class-variance-authority)
- **Icons**: Lucide React for general icons, react-icons for social media
- **Deployment**: Configured for standalone Docker builds with nginx reverse proxy

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
