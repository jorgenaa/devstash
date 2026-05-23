# Current Feature

Dashboard UI — Phase 1: scaffold the `/dashboard` route with shadcn/ui, a dark-mode-default layout, a top bar (search + New Item), and placeholder sidebar/main regions. Phase 1 of 3 — see [dashboard-phase-1-spec.md](features/dashboard-phase-1-spec.md).

## Status

Completed

## Goals

- Initialize shadcn/ui and install the components needed for phase 1
- Add a `/dashboard` route with the main layout and any global styles required
- Dark mode by default
- Top bar with search input and "New Item" button (display only — no behavior)
- Placeholders for sidebar and main content area (just `<h2>Sidebar</h2>` and `<h2>Main</h2>`)

## Notes

- Spec: [features/dashboard-phase-1-spec.md](features/dashboard-phase-1-spec.md)
- Reference screenshot: [screenshots/dashboard-ui-main.png](screenshots/dashboard-ui-main.png)
- Mock data source: [src/lib/mock-data.ts](../src/lib/mock-data.ts) — not wired up in phase 1, but available for later phases
- Follow-ups: [phase 2](features/dashboard-phase-2-spec.md), [phase 3](features/dashboard-phase-3-spec.md)

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-05-23 — Initial Next.js and Tailwind CSS v4 setup. Removed default Create Next App assets (`public/*.svg`), cleaned `src/app/page.tsx` and `src/app/globals.css`, added project context files under `context/`, and committed as `chore: initial next.js and tailwind setup`. Created private GitHub repo `jorgenaa/devstash` and pushed `main`.
- 2026-05-23 — Dashboard UI Phase 1 completed. Initialized shadcn/ui and added `Button` and `Input` components. Scaffolded the `/dashboard` route with a dark-mode-default layout, a top bar containing a centered search input flanked by a "DS / DevStash" logo on the left and a "New Item" button on the right, and placeholder `Sidebar` and `Main` regions.