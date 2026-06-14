import { prisma } from "@/lib/prisma";
import type { DashboardItem } from "@/lib/db/items";

export type FavoriteCollection = {
  id: string;
  name: string;
  itemCount: number;
  accentColor: string | null;
  updatedAt: Date;
};

const favoriteItemSelect = {
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
  itemType: { select: { name: true, icon: true, color: true } },
  tags: { select: { name: true } },
} as const;

export async function getFavoritedItems(userId: string): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: favoriteItemSelect,
  });

  return items.map((item) => ({
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
}

export async function getFavoritedCollections(userId: string): Promise<FavoriteCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true } },
      items: {
        take: 10,
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

  return collections.map((c) => {
    const counts = new Map<string, { color: string; count: number }>();
    for (const { item } of c.items) {
      const type = item.itemType;
      const entry = counts.get(type.id) ?? { color: type.color, count: 0 };
      entry.count += 1;
      counts.set(type.id, entry);
    }
    const top = [...counts.values()].sort((a, b) => b.count - a.count)[0];

    return {
      id: c.id,
      name: c.name,
      itemCount: c._count.items,
      accentColor: top?.color ?? null,
      updatedAt: c.updatedAt,
    };
  });
}
