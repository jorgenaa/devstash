# DevStash — Project Overview

> **One fast, searchable, AI-enhanced hub for all dev knowledge & resources.**

---

## Table of Contents

- [Problem](#problem)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Data Models](#data-models)
- [Features](#features)
- [UI/UX](#uiux)
- [Monetization](#monetization)
- [Architecture Notes](#architecture-notes)

---

## Problem

Developers keep their essentials scattered across too many places:

| What | Where it lives |
|---|---|
| Code snippets | VS Code, Notion |
| AI prompts | Chat history |
| Context files | Buried in project folders |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Commands | `.txt` files, bash history |
| Project templates | GitHub Gists |

DevStash replaces all of this with a single, unified hub.

---

## Target Users

| User | Primary Need |
|---|---|
| **Everyday Developer** | Fast access to snippets, prompts, commands, links |
| **AI-first Developer** | Store prompts, contexts, system messages, workflows |
| **Content Creator / Educator** | Organise code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 16 / React 19 | SSR pages + API routes in one repo |
| **Language** | TypeScript | Full type safety |
| **Database** | Neon (PostgreSQL) | Cloud-hosted |
| **ORM** | Prisma 7 | [Latest docs](https://www.prisma.io/docs) — fetch before use |
| **Auth** | NextAuth v5 | Email/password + GitHub OAuth |
| **File Storage** | Cloudflare R2 | For file/image uploads |
| **Cache** | Redis | Optional — evaluate during dev |
| **AI** | OpenAI `gpt-4o-mini` | Auto-tagging, summaries, code explain |
| **Styling** | Tailwind CSS v4 + shadcn/ui | [shadcn docs](https://ui.shadcn.com) |

> **⚠️ DB rule:** Never use `prisma db push` in any environment. Always generate and run migrations (`prisma migrate dev` → `prisma migrate deploy`).

---

## Data Models

### Prisma Schema

```prisma
model User {
  id                     String    @id @default(cuid())
  name                   String?
  email                  String    @unique
  emailVerified          DateTime?
  image                  String?
  password               String?   // hashed, null for OAuth users
  isPro                  Boolean   @default(false)
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]

  @@map("users")
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  items  Item[]

  @@map("item_types")
}

model Item {
  id          String   @id @default(cuid())
  title       String
  contentType String   // "text" | "file" | "url"
  content     String?  // text content or null if file
  fileUrl     String?  // Cloudflare R2 URL
  fileName    String?  // original filename
  fileSize    Int?     // bytes
  url         String?  // for link types
  description String?
  language    String?  // for code snippets (e.g. "typescript", "python")
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])
  tags       Tag[]
  collections ItemCollection[]

  @@map("items")
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // preferred type for new items in this collection
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  items  ItemCollection[]

  @@map("collections")
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
  @@map("item_collections")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  items Item[]

  @@map("tags")
}
```

---

## Features

### A. Item Types

Items have a type that determines how they are rendered and stored. Types have a `contentType` of `text`, `url`, or `file`.

| Type | Icon | Color | Content Type | URL Pattern | Pro Only |
|---|---|---|---|---|---|
| Snippet | `Code` | `#3b82f6` blue | text | `/items/snippets` | No |
| Prompt | `Sparkles` | `#8b5cf6` purple | text | `/items/prompts` | No |
| Note | `StickyNote` | `#fde047` yellow | text | `/items/notes` | No |
| Command | `Terminal` | `#f97316` orange | text | `/items/commands` | No |
| Link | `Link` | `#10b981` emerald | url | `/items/links` | No |
| File | `File` | `#6b7280` gray | file | `/items/files` | ✅ |
| Image | `Image` | `#ec4899` pink | file | `/items/images` | ✅ |

System types cannot be edited or deleted. Users can create custom types (planned for a later release).

Items are created and accessed via a **slide-over drawer** for speed.

---

### B. Collections

Collections group items of any type. An item can belong to **multiple collections**.

**Examples:**
- `React Patterns` — snippets, notes
- `Context Files` — files
- `Python Snippets` — snippets
- `Interview Prep` — snippets, prompts, notes

---

### C. Search

Full-text search across:
- Item title
- Item content
- Tags
- Item type

---

### D. Authentication

Handled by **NextAuth v5**:
- Email + password
- GitHub OAuth

---

### E. Core Features

- ⭐ Favorite collections and items
- 📌 Pin items to top
- 🕐 Recently used tracking (`lastUsedAt`)
- 📥 Import code from a file
- ✍️ Markdown editor for text-type items
- 📎 File upload for `file` / `image` types
- 📤 Export data (JSON / ZIP) — Pro only
- 🌙 Dark mode default, light mode optional
- 🔗 Add / remove items from multiple collections
- 👁️ View which collections an item belongs to

---

### F. AI Features (Pro only)

| Feature | Description |
|---|---|
| **Auto-tag suggestions** | Suggest relevant tags based on item content |
| **AI Summary** | Generate a short summary of any item |
| **Explain This Code** | Plain-English explanation of a code snippet |
| **Prompt Optimizer** | Improve and refine AI prompts |

Model: `gpt-4o-mini` via OpenAI API.

> During development, all users have access to all features regardless of Pro status.

---

## UI/UX

### Design Direction

- Modern, minimal, developer-focused
- Dark mode by default; light mode available
- Clean typography, generous whitespace, subtle borders
- References: **Notion**, **Linear**, **Raycast**
- Syntax highlighting on all code blocks (use [Shiki](https://shiki.matsu.io) or [highlight.js](https://highlightjs.org))

### Layout

```
┌─────────────────────────────────────────────────────┐
│  Sidebar (collapsible)    │  Main Content            │
│                           │                          │
│  Item Types               │  Collection Cards        │
│  ├─ Snippets              │  ┌──────┐  ┌──────┐     │
│  ├─ Prompts               │  │React │  │Python│     │
│  ├─ Commands              │  │Patt. │  │Snips │     │
│  ├─ Notes                 │  └──────┘  └──────┘     │
│  ├─ Links                 │                          │
│  └─ Files                 │  Items (color-coded)     │
│                           │  ┌────────────────────┐  │
│  Collections              │  │ useDebounce hook   │  │
│  ├─ React Patterns        │  └────────────────────┘  │
│  └─ Interview Prep        │                          │
└─────────────────────────────────────────────────────┘
                                    ↓ click item
                             ┌──────────────────┐
                             │   Item Drawer     │
                             │  (slide-over)     │
                             └──────────────────┘
```

- **Collection cards** — background color driven by the most common item type
- **Item cards** — border color driven by item type
- **Sidebar** — collapses to icon rail on desktop; becomes a drawer on mobile

### Micro-interactions

- Smooth slide transitions on drawer open/close
- Hover states on all cards
- Toast notifications for all actions (copy, save, delete, etc.)
- Loading skeletons while data fetches

### Responsive

- Desktop-first layout
- Mobile: sidebar becomes a bottom/side drawer

---

## Monetization

### Free Tier

- 50 items total
- 3 collections
- All non-file system types
- Basic search
- No file/image uploads
- No AI features

### Pro — $8/month or $72/year (save ~25%)

- Unlimited items
- Unlimited collections
- File & image uploads (Cloudflare R2)
- Custom item types *(later release)*
- All AI features
- Data export (JSON / ZIP)
- Priority support

Payments via **Stripe**. User model stores `stripeCustomerId` and `stripeSubscriptionId`.

---

## Architecture Notes

### API Routes (Next.js)

| Route | Purpose |
|---|---|
| `POST /api/items` | Create item |
| `GET /api/items` | List/search items |
| `PATCH /api/items/:id` | Update item |
| `DELETE /api/items/:id` | Delete item |
| `POST /api/collections` | Create collection |
| `POST /api/upload` | Upload file to R2 |
| `POST /api/ai/tag` | AI tag suggestions |
| `POST /api/ai/explain` | AI code explanation |
| `POST /api/ai/summarize` | AI item summary |
| `POST /api/ai/optimize-prompt` | AI prompt optimizer |
| `POST /api/webhooks/stripe` | Stripe webhook handler |

### Key Decisions

- **One repo** — Next.js handles both frontend and backend API routes, reducing overhead.
- **Prisma migrations only** — `prisma migrate dev` in development, `prisma migrate deploy` in CI/CD. Never `db push`.
- **R2 for files** — Direct upload from client via presigned URL, store the R2 URL on the Item record.
- **Pro gating** — Check `user.isPro` server-side on all Pro-only API routes. During development, bypass the check entirely.
- **Search** — Start with Postgres full-text search (`@@` operator via Prisma raw queries). Add dedicated search (e.g. Typesense) if performance requires it.
