"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";

const GenerateAutoTagsSchema = z.object({
  typeName: z.string().trim().min(1),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().optional(),
});

type GenerateAutoTagsResult =
  | { success: true; tags: string[] }
  | { success: false; error: string };

export async function generateAutoTags(
  input: z.input<typeof GenerateAutoTagsSchema>
): Promise<GenerateAutoTagsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "Pro subscription required" };
  }

  const parsed = GenerateAutoTagsSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const limit = await rateLimit(`ai:${session.user.id}`, 20, "1 h");
  if (!limit.success) {
    return { success: false, error: "Too many AI requests. Please try again in an hour." };
  }

  const { typeName, title, content } = parsed.data;
  const truncatedContent = content ? content.slice(0, 2000) : "";

  const userInput = [
    `Suggest 3-5 tags as a JSON object for this developer item:`,
    `Type: ${typeName}`,
    `Title: ${title}`,
    truncatedContent ? `Content:\n${truncatedContent}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Suggest 3-5 concise, relevant tags for the given developer item. Return ONLY a JSON object with a single key \"tags\" containing an array of lowercase tag strings. No explanations.",
      input: userInput,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = response.output_text;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { success: false, error: "AI returned an unexpected response" };
    }

    let tags: string[];
    if (Array.isArray(parsed)) {
      tags = parsed;
    } else if (
      parsed &&
      typeof parsed === "object" &&
      "tags" in parsed &&
      Array.isArray((parsed as Record<string, unknown>).tags)
    ) {
      tags = (parsed as { tags: unknown[] }).tags as string[];
    } else {
      return { success: false, error: "AI returned an unexpected response" };
    }

    const normalizedTags = tags
      .filter((t) => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.toLowerCase().trim())
      .slice(0, 5);

    return { success: true, tags: normalizedTags };
  } catch (err) {
    console.error("[generateAutoTags] error:", err);
    return { success: false, error: "AI service error. Please try again." };
  }
}
