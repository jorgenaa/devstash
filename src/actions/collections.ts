"use server";

import { z } from "zod";

import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
  type CollectionSummary,
} from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";
import { isAtCollectionLimit } from "@/lib/usage-limits";
import { requireAuth, parseOrError } from "./_utils";

const CollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().nullable().optional(),
});

type CreateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export async function createCollection(
  formData: z.input<typeof CollectionSchema>,
): Promise<CreateCollectionResult> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  if (!authResult.session.user.isPro) {
    const count = await prisma.collection.count({ where: { userId: authResult.userId } });
    if (isAtCollectionLimit(count)) {
      return { success: false, error: "Free plan limit reached. Upgrade to Pro for unlimited collections." };
    }
  }

  const parsed = parseOrError(CollectionSchema, formData);
  if (!parsed.ok) return parsed.error;

  const { name, description } = parsed.data;

  const collection = await dbCreateCollection(authResult.userId, {
    name,
    description: description ?? null,
  });

  return { success: true, data: collection };
}

type UpdateCollectionResult =
  | { success: true; data: CollectionSummary }
  | { success: false; error: string };

export async function updateCollection(
  collectionId: string,
  formData: z.input<typeof CollectionSchema>,
): Promise<UpdateCollectionResult> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const parsed = parseOrError(CollectionSchema, formData);
  if (!parsed.ok) return parsed.error;

  const { name, description } = parsed.data;

  const collection = await dbUpdateCollection(authResult.userId, collectionId, {
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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const result = await dbToggleCollectionFavorite(authResult.userId, collectionId);
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
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const deleted = await dbDeleteCollection(authResult.userId, collectionId);
  if (!deleted) {
    return { success: false, error: "Collection not found" };
  }

  return { success: true };
}
