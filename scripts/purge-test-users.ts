import "dotenv/config";

import { prisma } from "../src/lib/prisma";

const KEEP = [""];

async function main() {
  const targets = await prisma.user.findMany({
    where: { email: { notIn: KEEP } },
    select: { id: true, email: true },
  });

  if (targets.length === 0) {
    console.log("No users to delete.");
    return;
  }

  console.log(`Deleting ${targets.length} user(s):`);
  targets.forEach((u) => console.log(`  ${u.email}`));

  const ids = targets.map((u) => u.id);

  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: targets.map((u) => u.email) } },
  });

  await prisma.user.deleteMany({ where: { id: { in: ids } } });

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("FAILED:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
