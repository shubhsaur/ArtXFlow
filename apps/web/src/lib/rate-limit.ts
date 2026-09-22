import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from './logger';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Distributed rate limiting backed by Upstash Redis when
 * UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are configured.
 *
 * Falls back to an in-memory fixed-window limiter for local development
 * and single-instance deployments. The fallback is NOT suitable for
 * serverless/multi-instance production use — a warning is logged once.
 */

const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

let redis: Redis | null = null;
if (isUpstashConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });
} else if (process.env.NODE_ENV === 'production') {
  logger.warn(
    {},
    'UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — rate limiting uses an ' +
      'in-memory store that resets on cold starts and is not shared across instances.',
  );
}

// Cache one limiter per (limit, window) combination.
const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.fixedWindow(limit, `${windowMs} ms`),
      prefix: 'artxflow:ratelimit',
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// ---- In-memory fallback (dev / single-instance only) -----------------------

interface MemoryEntry {
  count: number;
  resetAt: number;
}

const memoryMap = new Map<string, MemoryEntry>();

// Periodically evict expired entries to avoid unbounded growth.
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    lastSweep = now;
    for (const [k, entry] of memoryMap) {
      if (entry.resetAt <= now) memoryMap.delete(k);
    }
  }

  const entry = memoryMap.get(key);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    memoryMap.set(key, { count: 1, resetAt });
    return { success: true, limit, remaining: limit - 1, reset: resetAt };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { success: entry.count <= limit, limit, remaining, reset: entry.resetAt };
}

/**
 * Checks whether `identifier` is within the rate limit.
 * Fails open (allows the request) if the distributed store errors, but logs it.
 */
export async function checkRateLimit(
  identifier: string,
  limit = 100,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  if (!redis) {
    return memoryRateLimit(identifier, limit, windowMs);
  }

  try {
    const result = await getUpstashLimiter(limit, windowMs).limit(identifier);
    return {
      success: result.success,
      limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (err) {
    logger.error({ err, identifier }, 'Rate limit store unavailable — failing open');
    return { success: true, limit, remaining: limit, reset: Date.now() + windowMs };
  }
}
