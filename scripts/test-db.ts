import "dotenv/config";

import { prisma } from "../src/lib/prisma.ts";

async function main() {
  console.log("Connecting to database…");

  const [{ now }] = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
  console.log(`Connected. Server time: ${now.toISOString()}`);

  const counts = {
    users: await prisma.user.count(),
    itemTypes: await prisma.itemType.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
    tags: await prisma.tag.count(),
  };

  console.log("Row counts:");
  console.table(counts);
}

main()
  .then(() => {
    console.log("OK");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
