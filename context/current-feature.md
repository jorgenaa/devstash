# Current Feature

_None — phase 3 complete. Dashboard UI is done._

## Status

Completed

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-05-23 — Initial Next.js and Tailwind CSS v4 setup. Removed default Create Next App assets (`public/*.svg`), cleaned `src/app/page.tsx` and `src/app/globals.css`, added project context files under `context/`, and committed as `chore: initial next.js and tailwind setup`. Created private GitHub repo `jorgenaa/devstash` and pushed `main`.
- 2026-05-23 — Dashboard UI Phase 1 completed. Initialized shadcn/ui and added `Button` and `Input` components. Scaffolded the `/dashboard` route with a dark-mode-default layout, a top bar containing a centered search input flanked by a "DS / DevStash" logo on the left and a "New Item" button on the right, and placeholder `Sidebar` and `Main` regions.
- 2026-05-23 — Dashboard UI Phase 2 completed. Added shadcn `sheet`, `avatar`, `tooltip`, `separator`, and `scroll-area` components and wrapped the root layout in `TooltipProvider`. Built `Sidebar` with a `Types` section (item types linked to `/items/[type]` with counts) and a `Collections` parent containing `FAVORITES` and `RECENT` sub-sections, plus a user avatar footer with a settings icon. Built `DashboardShell` to own the layout: header with a `PanelLeft` toggle (collapses to an icon rail with tooltips on desktop, opens a left-side `Sheet` drawer on mobile), desktop sidebar hidden below `md`. Added an `/items/[type]` route stub and an icon name → lucide component map in [src/lib/item-type-icons.ts](../src/lib/item-type-icons.ts).
- 2026-05-24 — Dashboard UI Phase 3 completed. Added shadcn `card` and `badge` components. Built the dashboard main area on `/dashboard` with: a "Dashboard / Your developer knowledge hub" header; 4 stats cards (items, collections, favorite items, favorite collections); a 6-card "Collections" grid sorted by most recent, each card showing the collection name, favorite star, item count, description, and per-type icon strip; a "Pinned" section listing pinned items; and a "Recent" section listing the 10 most recently updated items. Added a `typeIds` field to mock collections to drive the per-card icon strip. Renamed `item-type-icons.ts` → `.tsx` and exported an `ItemTypeIcon` helper that uses `React.createElement` to satisfy the `react-hooks/static-components` lint rule.
