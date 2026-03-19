import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis only if we have the credentials
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Allow infinite requests if redis is not configured (e.g. local dev)
const mockRateLimit = {
    limit: async () => ({ success: true, limit: 100, remaining: 99, reset: 0 }),
    getRemaining: async () => 99,
}

export const rateLimiters = {
  free: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 d"), // 100 requests per day for Free (General API)
    analytics: true,
  }) : mockRateLimit,
  
  pro: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1 d"), // 500 requests per day for Pro
    analytics: true,
  }) : mockRateLimit,
  
  team: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(2000, "1 d"), // 2000 requests per day for Team
    analytics: true,
  }) : mockRateLimit,
};

// Analysis-specific limiters (10/100/1000 per day)
export const analysisLimiters = {
  free: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 d"), 
    analytics: true,
    prefix: "ratelimit:analysis",
  }) : mockRateLimit,
  
  pro: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 d"),
    analytics: true,
    prefix: "ratelimit:analysis",
  }) : mockRateLimit,
  
  team: redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 d"),
    analytics: true,
    prefix: "ratelimit:analysis",
  }) : mockRateLimit,
};
