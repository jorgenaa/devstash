import { z } from "zod";
import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: { success: false as const, error: "Unauthorized" } };
  }
  return { ok: true as const, userId: session.user.id, session };
}

export function parseOrError<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
  fallbackMessage?: string
) {
  const result = schema.safeParse(input);
  if (!result.success) {
    const message = fallbackMessage ?? result.error.issues[0]?.message ?? "Invalid input";
    return { ok: false as const, error: { success: false as const, error: message } };
  }
  return { ok: true as const, data: result.data as z.infer<T> };
}
