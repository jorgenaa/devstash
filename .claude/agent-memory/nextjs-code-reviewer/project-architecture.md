---
name: project-architecture
description: DevStash codebase structure, data-fetching patterns, and known anti-patterns — updated after full review 2026-06-10
metadata:
  type: project
---

DevStash is a Next.js 16 / React 19 / Prisma 7 / NextAuth v5 developer knowledge hub.

**Why:** Updated after second full review (2026-06-10). Auth is now live.
**How to apply:** Use when reviewing any file in this codebase to understand data flow and known issues.

## Auth Status (as of 2026-06-10)

Auth is fully implemented:
- NextAuth v5 JWT strategy via `src/auth.ts` + `src/auth.config.ts` (edge-safe split).
- Middleware (`src/proxy.ts`) protects `/dashboard`, `/profile`, `/items/:path*`.
- Email+password and GitHub OAuth both working.
- Email verification flow, forgot/reset password, rate limiting on all auth endpoints.
- `allowDangerousEmailAccountLinking: true` on GitHub provider — intentional, allows linking to existing email accounts.

## Critical Data Scoping Bug (HIGH priority)

Dashboard server components `getPinnedItems`, `getRecentItems`, `getItemStats`, `getRecentCollections`, `getSidebarCollections`, `getCollectionStats`, `getSidebarItemTypes` ALL hardcode `DEMO_EMAIL = "demo@devstash.io"` and accept NO userId parameter.

The pages that call these DO have the authenticated session but don't pass userId to these functions. Any real (non-demo) authenticated user sees the demo user's data on their dashboard.

Functions that CORRECTLY scope to session.user.id: `getItemsByType`, `getItemDetail`, `updateItem`, `createItem`, `deleteItem`, `getProfileData`.

## Data-fetching pattern

- Server components fetch directly from Prisma (no client-side data fetching for reads, except ItemDetailDrawer which fetches via `/api/items/[id]`).
- Each async server component (StatsCards, RecentCollections, PinnedItems, RecentItems) makes its own independent DB calls. Dashboard page fires ~6 parallel Prisma calls.
- All pages have `export const dynamic = "force-dynamic"`.
- No Suspense boundaries wrapping the async server component sections of the dashboard (only a top-level loading.tsx exists).

## Repeated DB Query Logic

The `ItemDetail` select/mapping block is duplicated verbatim in `getItemDetail`, `updateItem`, and `createItem` inside `src/lib/db/items.ts`. A shared `itemDetailSelect` const and `mapToItemDetail()` helper could reduce ~100 lines of duplication.

## Security Notes

- No raw SQL (`$queryRaw`/`$executeRaw` not present).
- No `any` types.
- File upload validates MIME type and size server-side.
- Download proxy enforces `key.startsWith(userId/)` ownership check.
- `Content-Disposition` filename derived from sanitized R2 key (sanitized at upload time).
- `resend-verification` route leaks "Email is already verified" — minor user enumeration risk.

## Inline Styles

`style={{ color: type.color }}` and `style={{ backgroundColor: ... }}` appear throughout dashboard components — these are intentional for DB-driven runtime hex color values. Not a violation.

## Files Confirmed Clean

- `src/lib/prisma.ts` — correct singleton pattern
- `src/lib/utils.ts` — trivial cn() helper
- `src/app/layout.tsx` — clean
- `prisma/schema.prisma` — correct indexes, cascade deletes, NextAuth models
- all shadcn/ui components in `src/components/ui/` — standard generated code
- `src/lib/flags.ts`, `src/lib/resend.ts`, `src/lib/tokens.ts` — clean
- `src/actions/auth.ts` — trivial, clean
- `src/auth.config.ts` — edge-safe placeholder, correct
- `src/proxy.ts` — correct middleware pattern
