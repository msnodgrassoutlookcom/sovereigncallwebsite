import { getRedisClient } from "./redis"
import { NextResponse } from "next/server"

export interface RateLimitConfig {
  limit: number // Maximum number of requests
  window: number // Time window in seconds
  identifier?: string // Custom identifier (defaults to IP)
  keyPrefix?: string // Prefix for Redis keys
  errorMessage?: string // Custom error message
}

/**
 * Enhanced rate limiting middleware for API routes with sliding window
 *
 * @param handler - The API route handler
 * @param config - Rate limit configuration
 */
export function withRateLimit(handler: Function, config: RateLimitConfig) {
  return async (request: Request) => {
    const redis = getRedisClient()

    // If Redis is not available, skip rate limiting
    if (!redis) {
      return handler(request)
    }

    // Get client IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Use custom identifier or IP
    const identifier = config.identifier || `ip:${ip}`
    const prefix = config.keyPrefix || "ratelimit"
    const key = `${prefix}:${identifier}`

    // Use sliding window algorithm for more accurate rate limiting
    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.window

    try {
      // Add current timestamp to sorted set with score as timestamp
      await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })

      // Remove timestamps outside current window
      await redis.zremrangebyscore(key, 0, windowStart)

      // Set key expiry
      await redis.expire(key, config.window * 2)

      // Count requests within current window
      const requestCount = await redis.zcard(key)

      // If over limit, return 429
      if (requestCount > config.limit) {
        const resetTime = windowStart + config.window
        const retryAfter = resetTime - now

        return NextResponse.json(
          {
            error: config.errorMessage || "Too many requests",
            retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
              "X-RateLimit-Limit": String(config.limit),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(resetTime),
            },
          },
        )
      }

      // Calculate remaining requests
      const remaining = Math.max(0, config.limit - requestCount)

      // Call handler
      const response = await handler(request)

      // Add rate limit headers to response
      const headers = new Headers(response.headers)
      headers.set("X-RateLimit-Limit", String(config.limit))
      headers.set("X-RateLimit-Remaining", String(remaining))
      headers.set("X-RateLimit-Reset", String(windowStart + config.window))

      // Create new response with headers
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      console.error(`Rate limiting error: ${error}`)
      // On error, proceed with request
      return handler(request)
    }
  }
}

// Preset configurations for common rate limiting scenarios
export const rateLimits = {
  // Auth endpoints - strict limiting
  auth: {
    limit: 5, // 5 attempts
    window: 60 * 15, // 15 minutes
    keyPrefix: "ratelimit:auth",
  },

  // API endpoints - moderate limiting
  api: {
    limit: 60, // 60 requests
    window: 60, // 1 minute
    keyPrefix: "ratelimit:api",
  },

  // Public endpoints - lenient limiting
  public: {
    limit: 180, // 180 requests
    window: 60, // 1 minute
    keyPrefix: "ratelimit:public",
  },
}

// Convenience wrappers
export function withAuthRateLimit(handler: Function) {
  return withRateLimit(handler, rateLimits.auth)
}

export function withApiRateLimit(handler: Function) {
  return withRateLimit(handler, rateLimits.api)
}

export function withPublicRateLimit(handler: Function) {
  return withRateLimit(handler, rateLimits.public)
}
