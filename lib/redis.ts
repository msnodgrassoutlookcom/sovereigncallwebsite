import { Redis } from "@upstash/redis"
import { serverEnv } from "./env"

// Singleton pattern for server-side Redis client
let redisClient: Redis | null = null

/**
 * Get or create a Redis client instance
 * Uses singleton pattern to avoid creating multiple clients in serverless environment
 */
export function getRedisClient() {
  if (redisClient) return redisClient

  const url = serverEnv.redisUrl
  const token = serverEnv.redisToken

  if (!url || !token) {
    console.warn("Redis environment variables not set")
    return null
  }

  try {
    redisClient = new Redis({
      url,
      token,
      automaticDeserialization: true,
      retry: {
        retries: serverEnv.redisMaxRetries,
        backoff: (retryCount) => Math.min(Math.exp(retryCount) * serverEnv.redisRetryBackoff, 3000),
      },
      enableAutoPipelining: serverEnv.redisEnableAutoPipelining,
      connectTimeout: serverEnv.redisConnectionTimeout,
    })
    return redisClient
  } catch (error) {
    console.error("Failed to initialize Redis client:", error)
    return null
  }
}

/**
 * Get Redis client for server components and server actions
 * This is an alias for getRedisClient to maintain compatibility with existing code
 */
export function getServerRedisClient() {
  return getRedisClient()
}

/**
 * Check if Redis is properly configured
 */
export function isRedisConfigured() {
  return Boolean(serverEnv.redisUrl && serverEnv.redisToken)
}

/**
 * Check Redis connection health
 */
export async function checkRedisConnection() {
  try {
    const redis = getRedisClient()
    if (!redis) return { connected: false, error: "Redis client not initialized" }

    const startTime = Date.now()
    const pingResult = await redis.ping()
    const latency = Date.now() - startTime

    return {
      connected: pingResult === "PONG",
      pingResult,
      latency,
      clientInfo: {
        url: serverEnv.redisUrl ? "configured" : "missing",
        token: serverEnv.redisToken ? "configured" : "missing",
        maxRetries: serverEnv.redisMaxRetries,
        retryBackoff: serverEnv.redisRetryBackoff,
        enableAutoPipelining: serverEnv.redisEnableAutoPipelining,
        connectionTimeout: serverEnv.redisConnectionTimeout,
      },
    }
  } catch (error) {
    console.error("Redis connection check failed:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Perform a health check with detailed diagnostics
 */
export async function performRedisHealthCheck() {
  const redis = getRedisClient()
  if (!redis) return { status: "error", message: "Redis client not initialized" }

  try {
    // Basic connectivity check
    const startTime = Date.now()
    const pingResult = await redis.ping()
    const pingLatency = Date.now() - startTime

    // Memory usage check
    const memoryInfo = await redis.info("memory")

    // Server info check
    const serverInfo = await redis.info("server")

    // Stats check
    const statsInfo = await redis.info("stats")

    // Test set/get operations
    const setStart = Date.now()
    await redis.set("health:check:key", "test-value", { ex: 60 })
    const setValue = await redis.get("health:check:key")
    const getLatency = Date.now() - setStart

    return {
      status: pingResult === "PONG" ? "healthy" : "unhealthy",
      pingLatency,
      getLatency,
      setValue,
      memoryInfo,
      serverInfo,
      statsInfo,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}
