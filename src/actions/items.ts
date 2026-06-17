"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  createItem as dbCreateItem,
  toggleItemFavorite as dbToggleItemFavorite,
  toggleItemPin as dbToggleItemPin,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";
import { isAtItemLimit, isProOnlyType } from "@/lib/usage-limits";

const HTTP_URL = z
  .string()
  .url("Must be a valid URL")
  .refine((u) => /^https?:\/\//i.test(u), "URL must start with http:// or https://");

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: HTTP_URL.nullable().optional().or(z.literal("").transform(() => null)),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  collectionIds: z.array(z.string()).default([]),
});

type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function updateItem(
  itemId: string,
  formData: z.input<typeof UpdateItemSchema>
): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = UpdateItemSchema.safeParse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const { title, description, content, url, language, tags, collectionIds } = parsed.data;

  const updated = await dbUpdateItem(session.user.id, itemId, {
    title,
    description: description ?? null,
    content: content ?? null,
    url: url ?? null,
    language: language ?? null,
    tags,
    collectionIds,
  });

  if (!updated) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, data: updated };
}

const FILE_TYPES = ["file", "image"] as const;
const TEXT_TYPES = ["snippet", "prompt", "command", "note", "link"] as const;
const CREATABLE_TYPES = [...TEXT_TYPES, ...FILE_TYPES] as const;

const CreateItemSchema = z
  .object({
    typeName: z.enum(CREATABLE_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().nullable().optional(),
    content: z.string().nullable().optional(),
    url: HTTP_URL.nullable().optional().or(z.literal("").transform(() => null)),
    fileUrl: z.string().nullable().optional(),
    fileName: z.string().nullable().optional(),
    fileSize: z.number().nullable().optional(),
    language: z.string().trim().nullable().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    collectionIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.typeName === "link" && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL is required for links",
        path: ["url"],
      });
    }
    if ((data.typeName === "file" || data.typeName === "image") && !data.fileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A file must be uploaded",
        path: ["fileUrl"],
      });
    }
  });

type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export async function createItem(
  formData: z.input<typeof CreateItemSchema>
): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }


  if (!session.user.isPro) {
    const count = await prisma.item.count({ where: { userId: session.user.id } });
    if (isAtItemLimit(count)) {
      return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited items." };
    }
  }

  const parsed = CreateItemSchema.safeParse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const { typeName, title, description, content, url, fileUrl, fileName, fileSize, language, tags, collectionIds } =
    parsed.data;

  if (isProOnlyType(typeName) && !session.user.isPro) {
    return { success: false, error: "File and image uploads require Pro." };
  }

  const created = await dbCreateItem(session.user.id, {
    typeName,
    title,
    description: description ?? null,
    content: content ?? null,
    url: url ?? null,
    fileUrl: fileUrl ?? null,
    fileName: fileName ?? null,
    fileSize: fileSize ?? null,
    language: language ?? null,
    tags,
    collectionIds,
  });

  if (!created) {
    return { success: false, error: "Item type not found" };
  }

  return { success: true, data: created };
}

type ToggleItemFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

export async function toggleItemFavorite(itemId: string): Promise<ToggleItemFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await dbToggleItemFavorite(session.user.id, itemId);
  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, isFavorite: result.isFavorite };
}

type ToggleItemPinResult =
  | { success: true; isPinned: boolean }
  | { success: false; error: string };

export async function toggleItemPin(itemId: string): Promise<ToggleItemPinResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await dbToggleItemPin(session.user.id, itemId);
  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, isPinned: result.isPinned };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const deleted = await dbDeleteItem(session.user.id, itemId);
  if (!deleted) {
    return { success: false, error: "Item not found" };
  }

  if (deleted.fileUrl) {
    await deleteFromR2(deleted.fileUrl).catch(() => {});
  }

  return { success: true };
}
