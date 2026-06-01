---
name: project-architecture
description: DevStash codebase structure and patterns observed in first full scan (2026-05-28)
metadata:
  type: project
---

DevStash is a Next.js 16 / React 19 app in early development. Auth not yet implemented; demo user hardcoded in DB query functions. All reviews must NOT flag missing auth as an issue.

Key files: src/lib/db/items.ts, src/lib/db/collections.ts (all Prisma queries), src/components/dashboard/* (all dashboard UI), src/app/dashboard/page.tsx, src/app/items/[type]/page.tsx.

mock-data.ts is fully dead code — no imports anywhere in src/.

**Why:** Preserved per coding-standards.md instruction "No commented-out code unless specified" — this file should be deleted.
**How to apply:** Flag mock-data.ts as dead code in future reviews if not removed.
