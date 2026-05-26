import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const DEMO_EMAIL = "demo@devstash.io";

async function main() {
  console.log("Connecting to database…");

  const [{ now }] = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
  console.log(`Connected. Server time: ${now.toISOString()}\n`);

  const counts = {
    users: await prisma.user.count(),
    itemTypes: await prisma.itemType.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
    tags: await prisma.tag.count(),
  };
  console.log("Row counts:");
  console.table(counts);

  // ─── Demo data ───────────────────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: {
      collections: {
        orderBy: { name: "asc" },
        include: {
          items: {
            orderBy: { item: { title: "asc" } },
            include: { item: { include: { itemType: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    console.warn(`\nNo demo user found (${DEMO_EMAIL}). Run \`npm run prisma:seed\` first.`);
    return;
  }

  console.log(
    `\nDemo user: ${user.name} <${user.email}>  ` +
      `(isPro: ${user.isPro}, emailVerified: ${user.emailVerified ? "yes" : "no"})`,
  );

  const systemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });
  console.log("\nSystem item types:");
  console.table(
    systemTypes.map((t) => ({ name: t.name, icon: t.icon, color: t.color })),
  );

  console.log(`\nCollections (${user.collections.length}):`);
  console.table(
    user.collections.map((c) => ({
      name: c.name,
      favorite: c.isFavorite ? "★" : "",
      items: c.items.length,
      description: c.description ?? "",
    })),
  );

  for (const collection of user.collections) {
    console.log(`\n── ${collection.name} ${"─".repeat(Math.max(0, 40 - collection.name.length))}`);
    console.table(
      collection.items.map(({ item }) => ({
        title: item.title,
        type: item.itemType.name,
        contentType: item.contentType,
        pinned: item.isPinned ? "📌" : "",
        favorite: item.isFavorite ? "★" : "",
        preview: item.url ?? item.content?.split("\n")[0].slice(0, 50) ?? "",
      })),
    );
  }
}

main()
  .then(() => {
    console.log("\nOK");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
