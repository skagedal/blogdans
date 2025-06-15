# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db               # Generate TypeScript types from database schema
dbmate up             # Run database migrations
dbmate new <name>     # Create new migration
```

## Architecture Overview

This is a Next.js 15 blog application for skagedal.tech with App Router, featuring:

### Content System
- **Markdown blog posts** stored in `/content/posts/` with frontmatter
- **Filename-based dating**: Posts follow `YYYY-MM-DD-slug.md` convention
- **Draft support**: Posts can be marked as drafts in frontmatter
- **Navigation**: Chronological ordering with prev/next links

### Database Design
Uses PostgreSQL with Kysely query builder and a normalized schema:
- `blogdans_user` + `google_user` tables for dual identity model
- `post` table where `id` is the slug
- `comment` table with moderation via `approved_at` field
- Auto-updating timestamps via database triggers

### Authentication
- **NextAuth.js** with Google OAuth
- **Dual user model**: Google accounts link to internal blog users
- **Session middleware** protects routes
- **Development mock user** via `MOCK_USER` env var

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

## Development Notes

- **Type generation**: Run `pnpm db` after schema changes to update TypeScript types
- **Content**: Add new posts to `/content/posts/` following the date-slug naming convention
- **Styling**: Uses shadcn/ui components with Tailwind CSS helpers (tailwind-merge, clsx, class-variance-authority)
- **Icons**: Lucide React for general icons, react-icons for social media
- **Deployment**: Configured for standalone Docker builds with nginx reverse proxy