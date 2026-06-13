export const DEMO_EMAIL = "demo@devstash.io";

export const MAX_QUERY_LIMIT = 100;

export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

export function validateLimit(limit: number): number {
  return Math.min(Math.max(1, limit), MAX_QUERY_LIMIT);
}
