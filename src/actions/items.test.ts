"use server";

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

import { auth } from "@/auth";
import { deleteItem as dbDeleteItem } from "@/lib/db/items";
import { deleteItem } from "./items";

const mockAuth = vi.mocked(auth);
const mockDbDelete = vi.mocked(dbDeleteItem);

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
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as Awaited<ReturnType<typeof auth>>);
    mockDbDelete.mockResolvedValue(false);

    const result = await deleteItem("item-999");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockDbDelete).toHaveBeenCalledWith("user-1", "item-999");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as Awaited<ReturnType<typeof auth>>);
    mockDbDelete.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDbDelete).toHaveBeenCalledWith("user-1", "item-1");
  });
});
