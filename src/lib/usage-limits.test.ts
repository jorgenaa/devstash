import { describe, it, expect } from "vitest";
import {
  FREE_LIMITS,
  isAtItemLimit,
  isAtCollectionLimit,
  isProOnlyType,
} from "./usage-limits";

describe("FREE_LIMITS", () => {
  it("items limit is 50", () => {
    expect(FREE_LIMITS.items).toBe(50);
  });

  it("collections limit is 3", () => {
    expect(FREE_LIMITS.collections).toBe(3);
  });
});

describe("isAtItemLimit", () => {
  it("returns false when under limit", () => {
    expect(isAtItemLimit(49)).toBe(false);
  });

  it("returns true at exactly the limit", () => {
    expect(isAtItemLimit(50)).toBe(true);
  });

  it("returns true when over the limit", () => {
    expect(isAtItemLimit(51)).toBe(true);
  });
});

describe("isAtCollectionLimit", () => {
  it("returns false when under limit", () => {
    expect(isAtCollectionLimit(2)).toBe(false);
  });

  it("returns true at exactly the limit", () => {
    expect(isAtCollectionLimit(3)).toBe(true);
  });
});

describe("isProOnlyType", () => {
  it("returns true for file", () => {
    expect(isProOnlyType("file")).toBe(true);
  });

  it("returns true for image", () => {
    expect(isProOnlyType("image")).toBe(true);
  });

  it("returns false for snippet", () => {
    expect(isProOnlyType("snippet")).toBe(false);
  });
});
