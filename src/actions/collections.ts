"use server";

import { z } from "zod";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  type CollectionSummary,
} from "@/lib/db/collections";

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
