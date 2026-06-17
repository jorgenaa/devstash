export const FREE_LIMITS = {
  items: 50,
  collections: 3,
} as const;

export const PRO_ONLY_TYPES = new Set(["file", "image"]);

export function isAtItemLimit(count: number): boolean {
  return count >= FREE_LIMITS.items;
}

export function isAtCollectionLimit(count: number): boolean {
  return count >= FREE_LIMITS.collections;
}

export function isProOnlyType(typeName: string): boolean {
  return PRO_ONLY_TYPES.has(typeName);
}
