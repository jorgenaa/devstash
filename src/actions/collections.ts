"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
  type CollectionSummary,
} from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";
import { isAtCollectionLimit } from "@/lib/usage-limits";

const CreateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional(),
});

type CreateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export async function createCollection(
  formData: z.input<typeof CreateCollectionSchema>,
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    const count = await prisma.collection.count({ where: { userId: session.user.id } });
    if (isAtCollectionLimit(count)) {
      return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited collections." };
    }
  }

  const parsed = CreateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const { name, description } = parsed.data;

  const collection = await dbCreateCollection(session.user.id, {
    name,
    description: description ?? null,
  });

  return { success: true, data: collection };
}

const UpdateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional(),
});

type UpdateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export async function updateCollection(
  collectionId: string,
  formData: z.input<typeof UpdateCollectionSchema>,
): Promise<UpdateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = UpdateCollectionSchema.safeParse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const { name, description } = parsed.data;

  const collection = await dbUpdateCollection(session.user.id, collectionId, {
    name,
    description: description ?? null,
  });

  if (!collection) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true, data: collection };
}

type ToggleCollectionFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

export async function toggleCollectionFavorite(
  collectionId: string,
): Promise<ToggleCollectionFavoriteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = await dbToggleCollectionFavorite(session.user.id, collectionId);
  if (!result) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true, isFavorite: result.isFavorite };
}

type DeleteCollectionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteCollection(
  collectionId: string,
): Promise<DeleteCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const deleted = await dbDeleteCollection(session.user.id, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true };
}
