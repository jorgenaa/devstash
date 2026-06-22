"use server";

import { prisma } from "@/lib/prisma";
import { EditorPreferencesSchema } from "@/lib/db/editor-preferences";
import type { EditorPreferences } from "@/types/editor-preferences";
import { requireAuth, parseOrError } from "./_utils";

export async function updateEditorPreferences(
  prefs: EditorPreferences
): Promise<{ success: boolean; error?: string }> {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult.error;

  const parsed = parseOrError(EditorPreferencesSchema, prefs, "Invalid preferences");
  if (!parsed.ok) return parsed.error;

  await prisma.user.update({
    where: { id: authResult.userId },
    data: { editorPreferences: parsed.data },
  });

  return { success: true };
}
