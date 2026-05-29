import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL, validateLimit } from "@/lib/db/constants";

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
    take: validateLimit(limit),
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

export type SidebarCollection = {
  id: string;
  name: string;
  accentColor: string | null;
};

export async function getSidebarCollections(): Promise<{
  favorites: SidebarCollection[];
  recent: SidebarCollection[];
}> {
  const collections = await prisma.collection.findMany({
    where: { user: { email: DEMO_EMAIL } },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: { select: { id: true, color: true } },
            },
          },
        },
      },
    },
  });

  const toSidebarCollection = (
    c: (typeof collections)[number],
  ): SidebarCollection => {
    const counts = new Map<string, { color: string; count: number }>();
    for (const { item } of c.items) {
      const type = item.itemType;
      const entry = counts.get(type.id) ?? { color: type.color, count: 0 };
      entry.count += 1;
      counts.set(type.id, entry);
    }
    const top = [...counts.values()].sort((a, b) => b.count - a.count)[0];
    return { id: c.id, name: c.name, accentColor: top?.color ?? null };
  };

  return {
    favorites: collections.filter((c) => c.isFavorite).map(toSidebarCollection),
    recent: collections.slice(0, 5).map(toSidebarCollection),
  };
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
