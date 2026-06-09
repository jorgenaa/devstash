import { prisma } from "@/lib/prisma";
import { DEMO_EMAIL, validateLimit } from "@/lib/db/constants";

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: DashboardItemType;
  tags: string[];
  collections: { id: string; name: string }[];
};

export type DashboardItemType = {
  name: string;
  icon: string;
  color: string;
};

export type DashboardItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  type: DashboardItemType;
};


const itemSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  itemType: { select: { name: true, icon: true, color: true } },
  tags: { select: { name: true } },
} as const;

type ItemRow = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: DashboardItemType;
  tags: { name: string }[];
};

function toDashboardItem(item: ItemRow): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    fileUrl: item.fileUrl,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    tags: item.tags.map((tag) => tag.name),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
  };
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_EMAIL }, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });

  return items.map(toDashboardItem);
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { user: { email: DEMO_EMAIL } },
    orderBy: { updatedAt: "desc" },
    take: validateLimit(limit),
    select: itemSelect,
  });

  return items.map(toDashboardItem);
}

export async function getItemStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const where = { user: { email: DEMO_EMAIL } };
  const [total, favorites] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.count({ where: { ...where, isFavorite: true } }),
  ]);

  return { total, favorites };
}

export type SidebarItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
};

const ITEM_TYPE_ORDER = ["snippet", "prompt", "command", "note", "file", "image", "link"];

export async function getItemsByType(
  userId: string,
  typeName: string
): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, itemType: { name: typeName } },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });
  return items.map(toDashboardItem);
}

export async function getItemDetail(
  userId: string,
  itemId: string
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((c) => c.collection),
  };
}

export type UpdateItemInput = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
};

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemInput
): Promise<ItemDetail | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });
  if (!existing) return null;

  const item = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((c) => c.collection),
  };
}

export type CreateItemInput = {
  typeName: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  tags: string[];
};

const CONTENT_TYPE_MAP: Record<string, string> = {
  snippet: "text",
  prompt: "text",
  command: "text",
  note: "text",
  link: "url",
  file: "file",
  image: "file",
};

export async function createItem(
  userId: string,
  data: CreateItemInput
): Promise<ItemDetail | null> {
  const itemType = await prisma.itemType.findFirst({
    where: { name: data.typeName, isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
  });
  if (!itemType) return null;

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      language: data.language,
      contentType: CONTENT_TYPE_MAP[data.typeName] ?? "text",
      userId,
      itemTypeId: itemType.id,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  });

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.itemType,
    tags: item.tags.map((t) => t.name),
    collections: item.collections.map((c) => c.collection),
  };
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<{ fileUrl: string | null } | null> {
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true, fileUrl: true },
  });
  if (!existing) return null;

  await prisma.item.delete({ where: { id: itemId } });
  return { fileUrl: existing.fileUrl };
}

export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      _count: {
        select: { items: { where: { user: { email: DEMO_EMAIL } } } },
      },
    },
  });

  return types
    .map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort((a, b) => {
      const ai = ITEM_TYPE_ORDER.indexOf(a.name);
      const bi = ITEM_TYPE_ORDER.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}
