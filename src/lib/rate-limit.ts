import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

let _redis: Redis | null = null;

function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}

export async function rateLimit(
  key: string,
  requests: number,
  window: Duration
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { success: true, remaining: requests, reset: 0 };

  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
    });
    const result = await limiter.limit(key);
    return { success: result.success, remaining: result.remaining, reset: result.reset };
  } catch {
    // Fail open — allow the request if Redis is unavailable
    return { success: true, remaining: requests, reset: 0 };
  }
}

export function tooManyRequestsResponse(reset: number): Response {
  const retryAfterSeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return new Response(
    JSON.stringify({
      error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
