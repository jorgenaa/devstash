"use server";

import { z } from "zod";

import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";
import { requireAuth, parseOrError } from "./_utils";

// --- Local AI helpers ---

async function requireAIAccess() {
  const authResult = await requireAuth();
  if (!authResult.ok) return authResult;

  if (!authResult.session.user.isPro) {
    return { ok: false as const, error: { success: false as const, error: "Pro subscription required" } };
  }

  const limit = await rateLimit(`ai:${authResult.userId}`, 20, "1 h");
  if (!limit.success) {
    return { ok: false as const, error: { success: false as const, error: "Too many AI requests. Please try again in an hour." } };
  }

  return authResult;
}

async function callOpenAIRaw(instructions: string, userInput: string, logTag: string) {
  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions,
      input: userInput,
      text: { format: { type: "json_object" } },
    });

    try {
      return { ok: true as const, parsed: JSON.parse(response.output_text) as unknown };
    } catch {
      return { ok: false as const, error: "AI returned an unexpected response" };
    }
  } catch (err) {
    console.error(`[${logTag}]`, err);
    return { ok: false as const, error: "AI service error. Please try again." };
  }
}

async function callOpenAIString(instructions: string, userInput: string, key: string, logTag: string) {
  const result = await callOpenAIRaw(instructions, userInput, logTag);
  if (!result.ok) return { ok: false as const, error: { success: false as const, error: result.error } };

  const { parsed } = result;
  if (
    parsed &&
    typeof parsed === "object" &&
    key in parsed &&
    typeof (parsed as Record<string, unknown>)[key] === "string"
  ) {
    return { ok: true as const, value: (parsed as Record<string, string>)[key] };
  }

  return { ok: false as const, error: { success: false as const, error: "AI returned an unexpected response" } };
}

// --- Exported server actions ---

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
  const access = await requireAIAccess();
  if (!access.ok) return access.error;

  const parsed = parseOrError(ExplainCodeSchema, input);
  if (!parsed.ok) return parsed.error;

  const { typeName, title, content } = parsed.data;
  const truncatedContent = content.slice(0, 3000);

  const userInput = [
    `Type: ${typeName}`,
    `Title: ${title}`,
    `Content:\n${truncatedContent}`,
    "Return a JSON object.",
  ].join("\n");

  const result = await callOpenAIString(
    'You are a senior developer explaining code to a fellow developer. Given a code snippet or terminal command, write a clear explanation in 200-300 words covering what it does, how it works, and any key concepts. Use markdown for formatting (bold, inline code, bullet points where helpful). Return ONLY a JSON object with a single key "explanation" containing the markdown string.',
    userInput,
    "explanation",
    "explainCode"
  );
  if (!result.ok) return result.error;
  return { success: true, explanation: result.value };
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
  const access = await requireAIAccess();
  if (!access.ok) return access.error;

  const parsed = parseOrError(GenerateDescriptionSchema, input);
  if (!parsed.ok) return parsed.error;

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

  const result = await callOpenAIString(
    'You are a developer tool assistant. Write a concise 1-2 sentence description for the given developer item. Return ONLY a JSON object with a single key "description" containing the description string. Keep it developer-friendly and factual.',
    userInput,
    "description",
    "generateDescription"
  );
  if (!result.ok) return result.error;
  return { success: true, description: result.value };
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
  const access = await requireAIAccess();
  if (!access.ok) return access.error;

  const parsed = parseOrError(OptimizePromptSchema, input);
  if (!parsed.ok) return parsed.error;

  const { title, content } = parsed.data;
  const truncatedContent = content.slice(0, 3000);

  const userInput = [
    "Optimize this AI prompt (return a JSON object):",
    title ? `Title: ${title}` : "",
    `Prompt:\n${truncatedContent}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await callOpenAIString(
    'You are a prompt engineering expert. Improve the given AI prompt to make it clearer, more specific, and more effective. Fix any ambiguity, add structure where helpful, and ensure the goal is crystal clear. Preserve the original intent. Return ONLY a JSON object with a single key "optimizedPrompt" containing the improved prompt string.',
    userInput,
    "optimizedPrompt",
    "optimizePrompt"
  );
  if (!result.ok) return result.error;
  return { success: true, optimizedPrompt: result.value };
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
  const access = await requireAIAccess();
  if (!access.ok) return access.error;

  const parsed = parseOrError(GenerateAutoTagsSchema, input);
  if (!parsed.ok) return parsed.error;

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

  const rawResult = await callOpenAIRaw(
    "You are a developer tool assistant. Suggest 3-5 concise, relevant tags for the given developer item. Return ONLY a JSON object with a single key \"tags\" containing an array of lowercase tag strings. No explanations.",
    userInput,
    "generateAutoTags"
  );
  if (!rawResult.ok) return { success: false, error: rawResult.error };

  const json = rawResult.parsed;
  let tags: string[];
  if (Array.isArray(json)) {
    tags = json;
  } else if (
    json &&
    typeof json === "object" &&
    "tags" in json &&
    Array.isArray((json as Record<string, unknown>).tags)
  ) {
    tags = (json as { tags: unknown[] }).tags as string[];
  } else {
    return { success: false, error: "AI returned an unexpected response" };
  }

  const normalizedTags = tags
    .filter((t) => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.toLowerCase().trim())
    .slice(0, 5);

  return { success: true, tags: normalizedTags };
}
