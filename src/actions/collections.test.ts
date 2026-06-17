"use server";

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({
  createCollection: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: { count: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";
import { createCollection } from "./collections";

const mockAuth = vi.mocked(auth);
const mockDbCreate = vi.mocked(dbCreateCollection);
const mockCollectionCount = vi.mocked(prisma.collection.count);

describe("createCollection action", () => {
  const mockCollection = {
    id: "col-1",
    name: "React Patterns",
    description: "Useful React patterns",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createCollection({ name: "Test" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns validation error when name is empty", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as unknown as Awaited<ReturnType<typeof auth>>);

    const result = await createCollection({ name: "   " });

    expect(result).toEqual({ success: false, error: "Name is required" });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("returns success with created collection data", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue(mockCollection);

    const result = await createCollection({
      name: "React Patterns",
      description: "Useful React patterns",
    });

    expect(result).toEqual({ success: true, data: mockCollection });
    expect(mockDbCreate).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Useful React patterns",
    });
  });

  it("creates collection with null description when omitted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue({ ...mockCollection, description: null });

    const result = await createCollection({ name: "React Patterns" });

    expect(result.success).toBe(true);
    expect(mockDbCreate).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
  });

  it("blocks creation when free user hits 3-collection limit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockCollectionCount.mockResolvedValue(3);

    const result = await createCollection({ name: "New Collection" });

    expect(result).toEqual({
      success: false,
      error: "Free plan limit reached. Upgrade to Pro for unlimited collections.",
    });
    expect(mockDbCreate).not.toHaveBeenCalled();
  });

  it("allows creation when free user is under 3-collection limit", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: false } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockCollectionCount.mockResolvedValue(2);
    mockDbCreate.mockResolvedValue(mockCollection);

    const result = await createCollection({ name: "New Collection" });

    expect(result.success).toBe(true);
  });

  it("skips collection count check for Pro users", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1", isPro: true } } as unknown as Awaited<ReturnType<typeof auth>>);
    mockDbCreate.mockResolvedValue(mockCollection);

    await createCollection({ name: "New Collection" });

    expect(mockCollectionCount).not.toHaveBeenCalled();
  });
});
