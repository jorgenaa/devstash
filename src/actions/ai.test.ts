"use server";

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/openai", () => ({ getOpenAIClient: vi.fn(), AI_MODEL: "gpt-5-nano" }));
vi.mock("@/lib/rate-limit", () => ({ rateLimit: vi.fn() }));

import { auth } from "@/auth";
import { getOpenAIClient } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";
import { generateAutoTags } from "./ai";

const mockAuth = vi.mocked(auth);
const mockGetClient = vi.mocked(getOpenAIClient);
const mockRateLimit = vi.mocked(rateLimit);

const PRO_SESSION = { user: { id: "user-1", isPro: true } } as never;
const FREE_SESSION = { user: { id: "user-1", isPro: false } } as never;
const RATE_LIMIT_OK = { success: true, remaining: 19, reset: 0 };
const RATE_LIMIT_HIT = { success: false, remaining: 0, reset: Date.now() + 3600_000 };

function makeClient(outputText: string) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: outputText }),
    },
  };
}

describe("generateAutoTags action", () => {
  const validInput = { typeName: "snippet", title: "useDebounce hook", content: "function useDebounce..." };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns error for free user", async () => {
    mockAuth.mockResolvedValue(FREE_SESSION);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: false, error: "Pro subscription required" });
  });

  it("returns error when rate limited", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION);
    mockRateLimit.mockResolvedValue(RATE_LIMIT_HIT);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: false, error: "Too many AI requests. Please try again in an hour." });
  });

  it("returns error when AI call throws", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION);
    mockRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockGetClient.mockReturnValue({
      responses: { create: vi.fn().mockRejectedValue(new Error("network error")) },
    } as never);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("returns normalized tags from object format { tags: [...] }", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION);
    mockRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockGetClient.mockReturnValue(makeClient(JSON.stringify({ tags: ["React", "Hooks", "TypeScript"] })) as never);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: true, tags: ["react", "hooks", "typescript"] });
  });

  it("returns normalized tags from array format [...]", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION);
    mockRateLimit.mockResolvedValue(RATE_LIMIT_OK);
    mockGetClient.mockReturnValue(makeClient(JSON.stringify(["Debounce", "Performance", "Custom Hook"])) as never);

    const result = await generateAutoTags(validInput);

    expect(result).toEqual({ success: true, tags: ["debounce", "performance", "custom hook"] });
  });
});
