import { prisma } from "@/lib/prisma";
import { COLLECTIONS_PER_PAGE, DEMO_EMAIL, validateLimit } from "@/lib/db/constants";
import type { DashboardItem, DashboardItemType } from "@/lib/db/items";

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
    take: 20,
    include: {
      items: {
        take: 20,
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

export type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
};

export async function createCollection(
  userId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionSummary> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      userId,
    },
    select: { id: true, name: true, description: true },
  });
  return collection;
}

export type UserCollection = { id: string; name: string };

export async function getUserCollections(userId: string): Promise<UserCollection[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllCollections(
  userId: string,
  page = 1,
): Promise<{ collections: DashboardCollection[]; totalCount: number }> {
  const skip = (page - 1) * COLLECTIONS_PER_PAGE;
  const [rawCollections, totalCount] = await Promise.all([
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip,
      take: COLLECTIONS_PER_PAGE,
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
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const collections = rawCollections.map((collection) => {
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

  return { collections, totalCount };
}

const collectionItemSelect = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  itemType: { select: { id: true, name: true, icon: true, color: true } },
  tags: { select: { name: true } },
} as const;

export type CollectionWithItems = {
  collection: DashboardCollection;
  items: DashboardItem[];
  totalCount: number;
};

export async function getCollectionWithItems(
  userId: string,
  collectionId: string,
  page = 1,
): Promise<CollectionWithItems | null> {
  const skip = (page - 1) * COLLECTIONS_PER_PAGE;
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    include: {
      _count: { select: { items: true } },
      items: {
        orderBy: { addedAt: "desc" },
        skip,
        take: COLLECTIONS_PER_PAGE,
        include: {
          item: { select: collectionItemSelect },
        },
      },
    },
  });

  if (!collection) return null;

  const counts = new Map<string, { type: CollectionType; count: number }>();
  for (const { item } of collection.items) {
    const type = item.itemType;
    const entry = counts.get(type.id) ?? { type, count: 0 };
    entry.count += 1;
    counts.set(type.id, entry);
  }
  const byFrequency = [...counts.values()].sort((a, b) => b.count - a.count);

  const dashboardCollection: DashboardCollection = {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection._count.items,
    types: byFrequency.map((entry) => entry.type),
    accentColor: byFrequency[0]?.type.color ?? null,
  };

  const items: DashboardItem[] = collection.items.map(({ item }) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    tags: item.tags.map((t) => t.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
  }));

  return { collection: dashboardCollection, items, totalCount: collection._count.items };
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description?: string | null },
): Promise<CollectionSummary | null> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });
  if (!existing) return null;

  return prisma.collection.update({
    where: { id: collectionId },
    data: { name: data.name, description: data.description ?? null },
    select: { id: true, name: true, description: true },
  });
}

export async function deleteCollection(
  userId: string,
  collectionId: string,
): Promise<boolean> {
  const existing = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true },
  });
  if (!existing) return false;

  await prisma.collection.delete({ where: { id: collectionId } });
  return true;
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
