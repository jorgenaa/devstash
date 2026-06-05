import { describe, it, expect } from "vitest";
import { validateLimit, MAX_QUERY_LIMIT } from "./constants";

describe("validateLimit", () => {
  it("returns the value when within range", () => {
    expect(validateLimit(10)).toBe(10);
    expect(validateLimit(MAX_QUERY_LIMIT)).toBe(MAX_QUERY_LIMIT);
  });

  it("clamps to 1 for values below minimum", () => {
    expect(validateLimit(0)).toBe(1);
    expect(validateLimit(-10)).toBe(1);
  });

  it("clamps to MAX_QUERY_LIMIT for values above maximum", () => {
    expect(validateLimit(MAX_QUERY_LIMIT + 1)).toBe(MAX_QUERY_LIMIT);
    expect(validateLimit(9999)).toBe(MAX_QUERY_LIMIT);
  });
});
