import { prisma } from "@/lib/prisma";

// No auth yet — scope dashboard data to the seeded demo user until NextAuth lands.
const DEMO_EMAIL = "demo@devstash.io";

export type CollectionType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type DashboardCollection = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  types: CollectionType[];
  accentColor: string | null;
};

export async function getRecentCollections(
  limit = 6,
): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_EMAIL } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { items: true } },
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((collection) => {
    // Tally item types so the icon strip and accent reflect what's inside.
    const counts = new Map<string, { type: CollectionType; count: number }>();
    for (const { item } of collection.items) {
      const type = item.itemType;
      const entry = counts.get(type.id) ?? { type, count: 0 };
      entry.count += 1;
      counts.set(type.id, entry);
    }

    const byFrequency = [...counts.values()].sort((a, b) => b.count - a.count);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      types: byFrequency.map((entry) => entry.type),
      accentColor: byFrequency[0]?.type.color ?? null,
    };
  });
}

export async function getCollectionStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const where = { user: { email: DEMO_EMAIL } };
  const [total, favorites] = await Promise.all([
    prisma.collection.count({ where }),
    prisma.collection.count({ where: { ...where, isFavorite: true } }),
  ]);

  return { total, favorites };
}
