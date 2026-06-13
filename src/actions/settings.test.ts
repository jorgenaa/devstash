"use server";

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn() } },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateEditorPreferences } from "./settings";
import { DEFAULT_EDITOR_PREFERENCES } from "@/types/editor-preferences";

const mockAuth = vi.mocked(auth);
const mockUserUpdate = vi.mocked(prisma.user.update);

describe("updateEditorPreferences action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateEditorPreferences(DEFAULT_EDITOR_PREFERENCES);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid fontSize", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as unknown as Awaited<ReturnType<typeof auth>>);

    const result = await updateEditorPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 999,
    });

    expect(result).toEqual({ success: false, error: "Invalid preferences" });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("returns validation error for invalid theme", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as unknown as Awaited<ReturnType<typeof auth>>);

    const result = await updateEditorPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      theme: "solarized" as never,
    });

    expect(result).toEqual({ success: false, error: "Invalid preferences" });
    expect(mockUserUpdate).not.toHaveBeenCalled();
  });

  it("saves preferences and returns success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockUserUpdate.mockResolvedValue({} as never);

    const prefs = { fontSize: 14, tabSize: 4, wordWrap: false, minimap: true, theme: "monokai" as const };
    const result = await updateEditorPreferences(prefs);

    expect(result).toEqual({ success: true });
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { editorPreferences: prefs },
    });
  });
});
