export const DEMO_EMAIL = "demo@devstash.io";

export const MAX_QUERY_LIMIT = 100;

export function validateLimit(limit: number): number {
  return Math.min(Math.max(1, limit), MAX_QUERY_LIMIT);
}
