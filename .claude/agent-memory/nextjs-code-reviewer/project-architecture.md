---
name: project-architecture
description: DevStash codebase structure, data-fetching patterns, and known anti-patterns found in first full review (2026-05-28)
metadata:
  type: project
---

DevStash is a Next.js 16 / React 19 app. Auth (NextAuth v5) is not yet implemented; all DB queries are scoped to a hardcoded demo user (DEMO_EMAIL constant in both db/items.ts and db/collections.ts).

**Why:** Auth is planned but out of scope for the current phase — do NOT flag missing auth as an issue.
**How to apply:** When reviewing db query files, expect DEMO_EMAIL scoping and treat it as intentional.

## Data-fetching pattern
- Server components fetch directly from Prisma (no API routes for reads yet).
- db/items.ts and db/collections.ts are the sole DB query modules.
- Each async server component (StatsCards, RecentCollections, PinnedItems, RecentItems) makes its own independent DB calls. This means the dashboard page fires ~6 sequential Prisma round-trips across multiple RSC renders. No request-level caching or deduplication is in place.
- dashboard/page.tsx has `export const dynamic = "force-dynamic"`. items/[type]/page.tsx does NOT — it also calls getSidebarItemTypes and getSidebarCollections but lacks this directive.

## Key issues found in first review
- getSidebarItemTypes does two sequential awaits (findUnique for userId, then findMany). Could be one query.
- getSidebarCollections fetches ALL collections and ALL their item→itemType relations to compute accent colors, with no limit on collection count.
- mock-data.ts is completely dead code (no imports in src/).
- inline `style={}` used throughout dashboard components for dynamic colors (intentional — cannot be done with Tailwind alone for runtime hex values).
- ORDER constant in getSidebarItemTypes is defined inside the function body on every call.
- No error boundaries or loading.tsx in any route.
- No Suspense boundaries wrapping the async server component sections of the dashboard.
- pluralize() in Sidebar.tsx is a naive implementation that only checks endsWith("s").

## Files confirmed clean
- src/lib/prisma.ts — correct singleton pattern, no issues
- src/lib/utils.ts — trivial cn() helper, clean
- src/app/layout.tsx — clean
- prisma/schema.prisma — correct indexes, cascade deletes, NextAuth models present
- all shadcn/ui components in src/components/ui/ — standard generated code, no custom issues
- tsconfig.json — strict mode enabled, correct moduleResolution
- postcss.config.mjs — correct Tailwind v4 setup
- No tailwind.config.ts/js found (correctly using CSS-based config)
