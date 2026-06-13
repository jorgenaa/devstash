import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences";

export const EditorPreferencesSchema = z.object({
  fontSize: z.number().int().min(8).max(32),
  tabSize: z.number().int().min(1).max(8),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(["vs-dark", "monokai", "github-dark"]),
});

export async function getEditorPreferences(
  userId: string
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  if (!user?.editorPreferences) return DEFAULT_EDITOR_PREFERENCES;

  const parsed = EditorPreferencesSchema.safeParse(user.editorPreferences);
  return parsed.success ? parsed.data : DEFAULT_EDITOR_PREFERENCES;
}
