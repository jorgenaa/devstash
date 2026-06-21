"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";

const ExplainCodeSchema = z.object({
  typeName: z.enum(["snippet", "command"]),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

type ExplainCodeResult =
  | { success: true; explanation: string }
  | { success: false; error: string };

export async function explainCode(
  input: z.input<typeof ExplainCodeSchema>
): Promise<ExplainCodeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "Pro subscription required" };
  }

  const parsed = ExplainCodeSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const limit = await rateLimit(`ai:${session.user.id}`, 20, "1 h");
  if (!limit.success) {
    return { success: false, error: "Too many AI requests. Please try again in an hour." };
  }

  const { typeName, title, content } = parsed.data;
  const truncatedContent = content.slice(0, 3000);

  const userInput = [
    `Type: ${typeName}`,
    `Title: ${title}`,
    `Content:\n${truncatedContent}`,
    "Return a JSON object.",
  ].join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a senior developer explaining code to a fellow developer. Given a code snippet or terminal command, write a clear explanation in 200-300 words covering what it does, how it works, and any key concepts. Use markdown for formatting (bold, inline code, bullet points where helpful). Return ONLY a JSON object with a single key "explanation" containing the markdown string.',
      input: userInput,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = response.output_text;
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return { success: false, error: "AI returned an unexpected response" };
    }

    if (
      parsedJson &&
      typeof parsedJson === "object" &&
      "explanation" in parsedJson &&
      typeof (parsedJson as Record<string, unknown>).explanation === "string"
    ) {
      return { success: true, explanation: (parsedJson as { explanation: string }).explanation };
    }

    return { success: false, error: "AI returned an unexpected response" };
  } catch (err) {
    console.error("[explainCode] error:", err);
    return { success: false, error: "AI service error. Please try again." };
  }
}

const GenerateDescriptionSchema = z.object({
  typeName: z.string().trim().min(1),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().optional(),
  url: z.string().optional(),
  fileName: z.string().optional(),
});

type GenerateDescriptionResult =
  | { success: true; description: string }
  | { success: false; error: string };

export async function generateDescription(
  input: z.input<typeof GenerateDescriptionSchema>
): Promise<GenerateDescriptionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "Pro subscription required" };
  }

  const parsed = GenerateDescriptionSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const limit = await rateLimit(`ai:${session.user.id}`, 20, "1 h");
  if (!limit.success) {
    return { success: false, error: "Too many AI requests. Please try again in an hour." };
  }

  const { typeName, title, content, url, fileName } = parsed.data;
  const truncatedContent = content ? content.slice(0, 2000) : "";

  const userInput = [
    `Write a description for this developer item (return a JSON object):`,
    `Type: ${typeName}`,
    `Title: ${title}`,
    truncatedContent ? `Content:\n${truncatedContent}` : "",
    url ? `URL: ${url}` : "",
    fileName ? `File name: ${fileName}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a developer tool assistant. Write a concise 1-2 sentence description for the given developer item. Return ONLY a JSON object with a single key "description" containing the description string. Keep it developer-friendly and factual.',
      input: userInput,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = response.output_text;
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return { success: false, error: "AI returned an unexpected response" };
    }

    if (
      parsedJson &&
      typeof parsedJson === "object" &&
      "description" in parsedJson &&
      typeof (parsedJson as Record<string, unknown>).description === "string"
    ) {
      return { success: true, description: (parsedJson as { description: string }).description };
    }

    return { success: false, error: "AI returned an unexpected response" };
  } catch (err) {
    console.error("[generateDescription] error:", err);
    return { success: false, error: "AI service error. Please try again." };
  }
}

const OptimizePromptSchema = z.object({
  title: z.string().trim().optional(),
  content: z.string().trim().min(1, "Content is required"),
});

type OptimizePromptResult =
  | { success: true; optimizedPrompt: string }
  | { success: false; error: string };

export async function optimizePrompt(
  input: z.input<typeof OptimizePromptSchema>
): Promise<OptimizePromptResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!session.user.isPro) {
    return { success: false, error: "Pro subscription required" };
  }

  const parsed = OptimizePromptSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  const limit = await rateLimit(`ai:${session.user.id}`, 20, "1 h");
  if (!limit.success) {
    return { success: false, error: "Too many AI requests. Please try again in an hour." };
  }

  const { title, content } = parsed.data;
  const truncatedContent = content.slice(0, 3000);

  const userInput = [
    "Optimize this AI prompt (return a JSON object):",
    title ? `Title: ${title}` : "",
    `Prompt:\n${truncatedContent}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        'You are a prompt engineering expert. Improve the given AI prompt to make it clearer, more specific, and more effective. Fix any ambiguity, add structure where helpful, and ensure the goal is crystal clear. Preserve the original intent. Return ONLY a JSON object with a single key "optimizedPrompt" containing the improved prompt string.',
      input: userInput,
      text: {
        format: { type: "json_object" },
      },
    });

    const raw = response.output_text;
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      return { success: false, error: "AI returned an unexpected response" };
    }

    if (
      parsedJson &&
      typeof parsedJson === "object" &&
      "optimizedPrompt" in parsedJson &&
      typeof (parsedJson as Record<string, unknown>).optimizedPrompt === "string"
    ) {
      return {
        success: true,
        optimizedPrompt: (parsedJson as { optimizedPrompt: string }).optimizedPrompt,
      };
    }

    return { success: false, error: "AI returned an unexpected response" };
  } catch (err) {
    console.error("[optimizePrompt] error:", err);
    return { success: false, error: "AI service error. Please try again." };
  }
}

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
