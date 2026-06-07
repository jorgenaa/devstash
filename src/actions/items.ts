"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  createItem as dbCreateItem,
} from "@/lib/db/items";
import type { ItemDetail } from "@/lib/db/items";

const UpdateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z.string().url("Must be a valid URL").nullable().optional().or(z.literal("").transform(() => null)),
  language: z.string().trim().nullable().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
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

  const { title, description, content, url, language, tags } = parsed.data;

  const updated = await dbUpdateItem(session.user.id, itemId, {
    title,
    description: description ?? null,
    content: content ?? null,
    url: url ?? null,
    language: language ?? null,
    tags,
  });

  if (!updated) {
    return { success: false, error: "Item not found" };
  }

  return { success: true, data: updated };
}

const CREATABLE_TYPES = ["snippet", "prompt", "command", "note", "link"] as const;

const CreateItemSchema = z
  .object({
    typeName: z.enum(CREATABLE_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().nullable().optional(),
    content: z.string().nullable().optional(),
    url: z
      .string()
      .url("Must be a valid URL")
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    language: z.string().trim().nullable().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.typeName === "link" && !data.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL is required for links",
        path: ["url"],
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

  const parsed = CreateItemSchema.safeParse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const { typeName, title, description, content, url, language, tags } = parsed.data;

  const created = await dbCreateItem(session.user.id, {
    typeName,
    title,
    description: description ?? null,
    content: content ?? null,
    url: url ?? null,
    language: language ?? null,
    tags,
  });

  if (!created) {
    return { success: false, error: "Item type not found" };
  }

  return { success: true, data: created };
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

  return { success: true };
}
