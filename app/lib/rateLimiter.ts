/**
 * Sliding Window Rate Limiter for Hydrogen Storefront BFF
 * Protects downstream Shopify Storefront API quotas and mitigates brute-force attacks.
 */

export interface RateLimitOptions {
  /** Maximum number of allowed requests within the time window */
  maxRequests: number;
  /** Sliding window duration in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Total limit allocated */
  limit: number;
  /** Seconds until window completely resets */
  resetInSeconds: number;
  /** Seconds client should wait before retrying if rate limited */
  retryAfterSeconds: number;
}

interface Bucket {
  timestamps: number[];
  lastUpdated: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

/**
 * Safely extracts client IP from common proxy headers (Cloudflare, AWS, Nginx).
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;

  // 1. Cloudflare connecting IP
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  // 2. Standard X-Forwarded-For (leftmost is original client)
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    const firstIp = ips[0]?.trim();
    if (firstIp) return firstIp;
  }

  // 3. Nginx / reverse proxy X-Real-IP
  const xRealIp = headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim()) return xRealIp.trim();

  return '127.0.0.1';
}

/**
 * Checks and records a request against a sliding-window rate limit bucket.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
): RateLimitResult {
  const now = Date.now();
  const {maxRequests, windowMs} = options;

  let bucket = buckets.get(key);
  if (!bucket) {
    // Capacity management: evict oldest if at limit
    if (buckets.size >= MAX_BUCKETS) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey) buckets.delete(oldestKey);
    }
    bucket = {timestamps: [], lastUpdated: now};
    buckets.set(key, bucket);
  }

  // Sliding window: filter out timestamps older than (now - windowMs)
  const windowStart = now - windowMs;
  bucket.timestamps = bucket.timestamps.filter((ts) => ts > windowStart);
  bucket.lastUpdated = now;

  if (bucket.timestamps.length >= maxRequests) {
    const oldestInWindow = bucket.timestamps[0] ?? now;
    const retryAfterMs = Math.max(0, oldestInWindow + windowMs - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      remaining: 0,
      limit: maxRequests,
      resetInSeconds: retryAfterSeconds,
      retryAfterSeconds,
    };
  }

  // Request allowed: record current timestamp
  bucket.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - bucket.timestamps.length);
  const resetInSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  return {
    allowed: true,
    remaining,
    limit: maxRequests,
    resetInSeconds,
    retryAfterSeconds: 0,
  };
}

/**
 * Generates standard rate limit response headers for HTTP clients.
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetInSeconds.toString(),
  };

  if (!result.allowed && result.retryAfterSeconds > 0) {
    headers['Retry-After'] = result.retryAfterSeconds.toString();
  }

  return headers;
}

/**
 * Periodically prunes idle buckets that have been inactive longer than 10 minutes.
 */
export function pruneExpiredBuckets(maxIdleMs = 600_000): number {
  const now = Date.now();
  let pruned = 0;
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastUpdated > maxIdleMs) {
      buckets.delete(key);
      pruned++;
    }
  }
  return pruned;
}

/**
 * Resets all rate limit state (primarily used in automated tests).
 */
export function resetRateLimiter(): void {
  buckets.clear();
}
