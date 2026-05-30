# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — serve the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)

## Neon Database (MCP)

- **IMPORTANT:** **Always** use project ID `tiny-sky-42464007` (devstash) and branch ID `br-cool-snow-apj8op95` (development) for all Neon MCP tool calls.
- **Never** query or modify the `main` branch (`br-twilight-bar-apaeco6s`) or any other branch unless explicitly told to.
- **Never** run destructive SQL (`DROP`, `DELETE`, `TRUNCATE`, `UPDATE` without `WHERE`) without explicit user approval.

**IMPORTANT** Do not add any Claude to any commit messages
