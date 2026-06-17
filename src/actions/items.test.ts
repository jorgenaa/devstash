"use server";

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  createItem: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { count: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { deleteItem as dbDeleteItem, createItem as dbCreateItem } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";
import { deleteItem, createItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockDbDelete = vi.mocked(dbDeleteItem);
const mockDbCreate = vi.mocked(dbCreateItem);
const mockItemCount = vi.mocked(prisma.item.count);

describe("deleteItem action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it("returns not found when item does not exist or is not owned by user", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbDelete.mockResolvedValue(null);

    const result = await deleteItem("item-999");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockDbDelete).toHaveBeenCalledWith("user-1", "item-999");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbDelete.mockResolvedValue({ fileUrl: null });

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("user-1", "item-1");
  });
});

describe("createItem action", () => {
  const validSnippet = {
    typeName: "snippet" as const,
    title: "My Snippet",
    description: null,
    content: "console.log('hi')",
    url: null,
    language: "javascript",
    tags: ["js"],
  };

  const mockItemDetail = {
    id: "new-item-1",
    title: "My Snippet",
    description: null,
    content: "console.log('hi')",
    url: null,
    fileUrl: null,
    fileName: null,
    fileSize: null,
    language: "javascript",
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: { name: "snippet", icon: "Code", color: "#3b82f6" },
    tags: ["js"],
    collections: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createItem(validSnippet);

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);

    const result = await createItem({ ...validSnippet, title: "   " });

    expect(result).toEqual({ success: false, error: "Title is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error when link type has no URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);

    const result = await createItem({
      typeName: "link",
      title: "Some Link",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
    });

    expect(result).toEqual({ success: false, error: "URL is required for links" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns error when item type is not found in DB", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue(null);

    const result = await createItem(validSnippet);

    expect(result).toEqual({ success: false, error: "Item type not found" });
  });

  it("returns success with created item data", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue(mockItemDetail);

    const result = await createItem(validSnippet);

    expect(result).toEqual({ success: true, data: mockItemDetail });
    expect(mockDbCreate).toHaveBeenCalledWith("user-1", {
      typeName: "snippet",
      title: "My Snippet",
      description: null,
      content: "console.log('hi')",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "javascript",
      tags: ["js"],
      collectionIds: [],
    });
  });

  it("accepts a valid link with URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue({ ...mockItemDetail, type: { name: "link", icon: "Link", color: "#10b981" } });

    const result = await createItem({
      typeName: "link",
      title: "GitHub",
      description: null,
      content: null,
      url: "https://github.com",
      language: null,
      tags: [],
    });

    expect(result.success).toBe(true);
  });

  it("blocks creation when free user hits 50-item limit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as Awaited<ReturnType<typeof auth>>);
    mockItemCount.mockResolvedValue(50);

    const result = await createItem(validSnippet);

    expect(result).toEqual({
      success: false,
      error: "Free plan limit reached. Upgrade to Pro for unlimited items.",
    });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("allows creation when free user is under 50-item limit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as Awaited<ReturnType<typeof auth>>);
    mockItemCount.mockResolvedValue(49);
    mockDbCreate.mockResolvedValue(mockItemDetail);

    const result = await createItem(validSnippet);

    expect(result.success).toBe(true);
  });

  it("skips item count check for Pro users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue(mockItemDetail);

    await createItem(validSnippet);

    expect(mockItemCount).not.toHaveBeenCalled();
  });

  it("blocks file type for free users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as Awaited<ReturnType<typeof auth>>);
    mockItemCount.mockResolvedValue(0);

    const result = await createItem({
      typeName: "file",
      title: "My File",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
      fileUrl: "some/key.pdf",
      fileName: "doc.pdf",
      fileSize: 1234,
    });

    expect(result).toEqual({ success: false, error: "File and image uploads require Pro." });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("allows file type for Pro users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue({
      ...mockItemDetail,
      type: { name: "file", icon: "File", color: "#6b7280" },
    });

    const result = await createItem({
      typeName: "file",
      title: "My File",
      description: null,
      content: null,
      url: null,
      language: null,
      tags: [],
      fileUrl: "some/key.pdf",
      fileName: "doc.pdf",
      fileSize: 1234,
    });

    expect(result.success).toBe(true);
    expect(mockItemCount).not.toHaveBeenCalled();
  });
});
