import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";
const DEMO_PASSWORD = "12345678";

const SYSTEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
] as const;

type TypeName = (typeof SYSTEM_TYPES)[number]["name"];

async function upsertSystemType(
  name: string,
  icon: string,
  color: string,
): Promise<string> {
  const existing = await prisma.itemType.findFirst({
    where: { name, isSystem: true, userId: null },
  });

  if (existing) {
    const updated = await prisma.itemType.update({
      where: { id: existing.id },
      data: { icon, color },
    });
    return updated.id;
  }

  const created = await prisma.itemType.create({
    data: { name, icon, color, isSystem: true },
  });
  return created.id;
}

async function main() {
  console.log("Seeding database…");

  // ─── Demo user (idempotent via upsert on unique email) ───────────────
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User", password: passwordHash, emailVerified: new Date() },
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password: passwordHash,
      emailVerified: new Date(),
      isPro: false,
    },
  });
  console.log(`Demo user ready: ${user.email}`);

  // ─── System item types (idempotent; stable ids) ──────────────────────
  const typeIds = {} as Record<TypeName, string>;
  for (const t of SYSTEM_TYPES) {
    typeIds[t.name] = await upsertSystemType(t.name, t.icon, t.color);
  }
  console.log(`System item types ready: ${SYSTEM_TYPES.length}`);

  // ─── Wipe the demo user's collections & items for a clean dataset ─────
  // ItemCollection join rows cascade from both sides.
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.collection.deleteMany({ where: { userId: user.id } });

  const now = Date.now();
  const daysAgo = (n: number) => new Date(now - n * 24 * 60 * 60 * 1000);

  // ─── Collection + items builder ──────────────────────────────────────
  type SeedItem = {
    title: string;
    type: TypeName;
    contentType: "text" | "url";
    content?: string;
    url?: string;
    description?: string;
    language?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    lastUsedAt?: Date;
  };

  async function createCollection(
    name: string,
    description: string,
    items: SeedItem[],
    opts: { isFavorite?: boolean } = {},
  ) {
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        userId: user.id,
        isFavorite: opts.isFavorite ?? false,
      },
    });

    for (const item of items) {
      await prisma.item.create({
        data: {
          title: item.title,
          contentType: item.contentType,
          content: item.content ?? null,
          url: item.url ?? null,
          description: item.description ?? null,
          language: item.language ?? null,
          isFavorite: item.isFavorite ?? false,
          isPinned: item.isPinned ?? false,
          lastUsedAt: item.lastUsedAt ?? null,
          userId: user.id,
          itemTypeId: typeIds[item.type],
          collections: { create: [{ collectionId: collection.id }] },
        },
      });
    }

    console.log(`  • ${name} (${items.length} items)`);
    return collection;
  }

  // ─── React Patterns ──────────────────────────────────────────────────
  await createCollection(
    "React Patterns",
    "Reusable React patterns and hooks",
    [
      {
        title: "useDebounce hook",
        type: "snippet",
        contentType: "text",
        language: "typescript",
        description: "Debounce a rapidly-changing value (e.g. a search input).",
        isPinned: true,
        lastUsedAt: daysAgo(1),
        content: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}`,
      },
      {
        title: "Theme context provider",
        type: "snippet",
        contentType: "text",
        language: "typescript",
        description: "Compound context provider with a typed consumer hook.",
        lastUsedAt: daysAgo(4),
        content: `import { createContext, useContext, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}`,
      },
      {
        title: "cn() className utility",
        type: "snippet",
        contentType: "text",
        language: "typescript",
        description: "Merge conditional Tailwind classes without conflicts.",
        isFavorite: true,
        lastUsedAt: daysAgo(2),
        content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
      },
    ],
    { isFavorite: true },
  );

  // ─── AI Workflows ────────────────────────────────────────────────────
  await createCollection(
    "AI Workflows",
    "AI prompts and workflow automations",
    [
      {
        title: "Code review prompt",
        type: "prompt",
        contentType: "text",
        description: "Ask an LLM for a focused, actionable code review.",
        lastUsedAt: daysAgo(3),
        content: `You are a senior engineer performing a code review.

Review the diff below and report ONLY substantive issues, grouped by severity (blocker / warning / nit). For each issue give the file, a one-line description, and a concrete fix. Focus on correctness, security, and edge cases over style. If you find nothing material, say so.

\`\`\`diff
{{DIFF}}
\`\`\``,
      },
      {
        title: "Documentation generation prompt",
        type: "prompt",
        contentType: "text",
        description: "Generate reference docs from a source file.",
        isFavorite: true,
        lastUsedAt: daysAgo(6),
        content: `Generate developer documentation for the following module.

Produce: a one-paragraph overview, a table of every exported function/type (name, signature, description), and a short usage example. Use Markdown. Infer intent from names and types; do not invent behavior that isn't in the code.

\`\`\`
{{CODE}}
\`\`\``,
      },
      {
        title: "Refactoring assistant prompt",
        type: "prompt",
        contentType: "text",
        description: "Refactor code while preserving behavior.",
        lastUsedAt: daysAgo(8),
        content: `Refactor the code below for readability and maintainability WITHOUT changing its observable behavior.

Constraints:
- Keep the public API identical.
- Prefer small, named functions over comments.
- Call out any behavior you were unsure about instead of guessing.

Return the refactored code, then a short bullet list of what you changed and why.

\`\`\`
{{CODE}}
\`\`\``,
      },
    ],
  );

  // ─── DevOps ──────────────────────────────────────────────────────────
  await createCollection(
    "DevOps",
    "Infrastructure and deployment resources",
    [
      {
        title: "Multi-stage Node Dockerfile",
        type: "snippet",
        contentType: "text",
        language: "dockerfile",
        description: "Slim production image using a multi-stage build.",
        lastUsedAt: daysAgo(5),
        content: `# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]`,
      },
      {
        title: "Build & push Docker image",
        type: "command",
        contentType: "text",
        description: "Tag with the short commit SHA and push to the registry.",
        lastUsedAt: daysAgo(7),
        content: `docker build -t registry.example.com/devstash:$(git rev-parse --short HEAD) . \\
  && docker push registry.example.com/devstash:$(git rev-parse --short HEAD)`,
      },
      {
        title: "Docker documentation",
        type: "link",
        contentType: "url",
        url: "https://docs.docker.com",
        description: "Official Docker reference and guides.",
      },
      {
        title: "GitHub Actions documentation",
        type: "link",
        contentType: "url",
        url: "https://docs.github.com/actions",
        description: "Workflow syntax and CI/CD reference.",
      },
    ],
  );

  // ─── Terminal Commands ───────────────────────────────────────────────
  await createCollection(
    "Terminal Commands",
    "Useful shell commands for everyday development",
    [
      {
        title: "Undo last commit, keep changes",
        type: "command",
        contentType: "text",
        description: "Soft-reset to the previous commit, leaving work staged.",
        isPinned: true,
        lastUsedAt: daysAgo(1),
        content: `git reset --soft HEAD~1`,
      },
      {
        title: "Remove all stopped containers",
        type: "command",
        contentType: "text",
        description: "Reclaim disk by pruning exited Docker containers.",
        lastUsedAt: daysAgo(9),
        content: `docker container prune -f`,
      },
      {
        title: "Kill the process on a port",
        type: "command",
        contentType: "text",
        description: "Find and terminate whatever is holding port 3000.",
        lastUsedAt: daysAgo(2),
        content: `lsof -ti:3000 | xargs kill -9`,
      },
      {
        title: "List outdated global npm packages",
        type: "command",
        contentType: "text",
        description: "Audit globally installed packages for updates.",
        content: `npm outdated -g --depth=0`,
      },
    ],
  );

  // ─── Design Resources ────────────────────────────────────────────────
  await createCollection(
    "Design Resources",
    "UI/UX resources and references",
    [
      {
        title: "Tailwind CSS",
        type: "link",
        contentType: "url",
        url: "https://tailwindcss.com",
        description: "Utility-first CSS framework documentation.",
        isFavorite: true,
        lastUsedAt: daysAgo(1),
      },
      {
        title: "shadcn/ui",
        type: "link",
        contentType: "url",
        url: "https://ui.shadcn.com",
        description: "Accessible, copy-paste React component library.",
        lastUsedAt: daysAgo(2),
      },
      {
        title: "Material Design 3",
        type: "link",
        contentType: "url",
        url: "https://m3.material.io",
        description: "Google's design system guidelines.",
      },
      {
        title: "Lucide Icons",
        type: "link",
        contentType: "url",
        url: "https://lucide.dev",
        description: "Open-source icon set used across the app.",
      },
    ],
    { isFavorite: true },
  );

  const [items, collections] = await Promise.all([
    prisma.item.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id } }),
  ]);
  console.log(`Done. ${collections} collections, ${items} items for ${user.email}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
