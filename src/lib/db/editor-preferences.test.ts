import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { getEditorPreferences } from "./editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES } from "@/types/editor-preferences";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

describe("getEditorPreferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns defaults when user is not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults when editorPreferences is null", async () => {
    mockFindUnique.mockResolvedValue({ editorPreferences: null } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults when stored value fails schema validation", async () => {
    mockFindUnique.mockResolvedValue({
      editorPreferences: { fontSize: "big", theme: "unknown" },
    } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns parsed preferences when stored value is valid", async () => {
    const stored = { fontSize: 14, tabSize: 4, wordWrap: false, minimap: true, theme: "monokai" };
    mockFindUnique.mockResolvedValue({ editorPreferences: stored } as never);

    const result = await getEditorPreferences("user-1");

    expect(result).toEqual(stored);
  });
});
