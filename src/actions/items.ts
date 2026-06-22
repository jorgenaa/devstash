"use server";

import { z } from "zod";

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
import { requireAuth, parseOrError } from "./_utils";

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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const parsed = parseOrError(UpdateItemSchema, formData);
  if (!parsed.ok) return parsed.error;

  const { title, description, content, url, language, tags, collectionIds } = parsed.data;

  const updated = await dbUpdateItem(authResult.userId, itemId, {
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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  if (!authResult.session.user.isPro) {
    const count = await prisma.item.count({ where: { userId: authResult.userId } });
    if (isAtItemLimit(count)) {
      return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited items." };
    }
  }

  const parsed = parseOrError(CreateItemSchema, formData);
  if (!parsed.ok) return parsed.error;

  const { typeName, title, description, content, url, fileUrl, fileName, fileSize, language, tags, collectionIds } =
    parsed.data;

  if (isProOnlyType(typeName) && !authResult.session.user.isPro) {
    return { success: false, error: "File and image uploads require Pro." };
  }

  const created = await dbCreateItem(authResult.userId, {
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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const result = await dbToggleItemFavorite(authResult.userId, itemId);
  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, isFavorite: result.isFavorite };
}

type ToggleItemPinResult =
  | { success: true; isPinned: boolean }
  | { success: false; error: string };

export async function toggleItemPin(itemId: string): Promise<ToggleItemPinResult> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const result = await dbToggleItemPin(authResult.userId, itemId);
  if (!result) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, isPinned: result.isPinned };
}

type DeleteItemResult = { success: true } | { success: false; error: string };

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const deleted = await dbDeleteItem(authResult.userId, itemId);
  if (!deleted) {
    return { success: false, error: "Item not found" };
  }

  if (deleted.fileUrl) {
    await deleteFromR2(deleted.fileUrl).catch(() => {});
  }

  return { success: true };
}
