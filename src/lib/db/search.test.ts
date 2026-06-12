import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { getSearchData } from "./search";

const mockItemFindMany = vi.mocked(prisma.item.findMany);
const mockCollectionFindMany = vi.mocked(prisma.collection.findMany);

const baseItemType = { name: "snippet", icon: "Code", color: "#3b82f6" };

describe("getSearchData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses description as contentPreview when available", async () => {
    mockItemFindMany.mockResolvedValue([
      { id: "i1", title: "Hook", description: "A React hook", content: "const x = ...", itemType: baseItemType },
    ] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);

    const result = await getSearchData("user-1");

    expect(result.items[0].contentPreview).toBe("A React hook");
  });

  it("falls back to content slice when description is null", async () => {
    const longContent = "a".repeat(200);
    mockItemFindMany.mockResolvedValue([
      { id: "i1", title: "Hook", description: null, content: longContent, itemType: baseItemType },
    ] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);

    const result = await getSearchData("user-1");

    expect(result.items[0].contentPreview).toBe("a".repeat(100));
  });

  it("returns null contentPreview when both description and content are null", async () => {
    mockItemFindMany.mockResolvedValue([
      { id: "i1", title: "Link item", description: null, content: null, itemType: baseItemType },
    ] as never);
    mockCollectionFindMany.mockResolvedValue([] as never);

    const result = await getSearchData("user-1");

    expect(result.items[0].contentPreview).toBeNull();
  });

  it("maps collections with correct itemCount", async () => {
    mockItemFindMany.mockResolvedValue([] as never);
    mockCollectionFindMany.mockResolvedValue([
      { id: "c1", name: "React Patterns", _count: { items: 5 } },
    ] as never);

    const result = await getSearchData("user-1");

    expect(result.collections).toEqual([{ id: "c1", name: "React Patterns", itemCount: 5 }]);
  });
});
