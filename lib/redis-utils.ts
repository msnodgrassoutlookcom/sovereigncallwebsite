import { getServerRedisClient } from "./redis"
import { CACHE_TIMES } from "./cache"
import { kv } from "@vercel/kv"

/**
 * Check if Redis connection is working
 */
export async function checkRedisConnection() {
  try {
    // Try to set and get a simple key-value pair
    const testKey = `connection-test-${Date.now()}`
    const testValue = `test-value-${Date.now()}`

    await kv.set(testKey, testValue, { ex: 60 }) // Expire in 60 seconds
    const retrievedValue = await kv.get(testKey)

    const isConnected = retrievedValue === testValue

    return {
      connected: isConnected,
      testKey,
      testValue,
      retrievedValue,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Redis connection check failed:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Perform a more detailed Redis health check
 */
export async function performRedisHealthCheck() {
  try {
    const startTime = performance.now()

    // Test 1: Set operation
    const setKey = `health-test-set-${Date.now()}`
    await kv.set(setKey, "test-value", { ex: 60 })

    // Test 2: Get operation
    await kv.get(setKey)

    // Test 3: Delete operation
    await kv.del(setKey)

    const endTime = performance.now()
    const responseTime = endTime - startTime

    return {
      status: "healthy",
      responseTime: `${responseTime.toFixed(2)}ms`,
      operations: ["set", "get", "del"],
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

// Forum view count functions
export async function incrementThreadView(threadId: string): Promise<number> {
  const redis = getServerRedisClient()
  if (!redis) return 0

  const key = `thread:${threadId}:views`
  const views = await redis.incr(key)

  // If this is a new key, set expiration to avoid storing forever
  if (views === 1) {
    await redis.expire(key, CACHE_TIMES.WEEK)
  }

  return views
}

export async function getThreadViews(threadId: string): Promise<number> {
  const redis = getServerRedisClient()
  if (!redis) return 0

  const views = await redis.get<number>(`thread:${threadId}:views`)
  return views || 0
}

// User session caching
export async function cacheUserSession(userId: string, sessionData: any): Promise<void> {
  const redis = getServerRedisClient()
  if (!redis) return

  await redis.set(`user:${userId}:session`, JSON.stringify(sessionData), {
    ex: CACHE_TIMES.DAY,
  })
}

export async function getUserSession(userId: string): Promise<any | null> {
  const redis = getServerRedisClient()
  if (!redis) return null

  const sessionData = await redis.get<string>(`user:${userId}:session`)
  if (!sessionData) return null

  try {
    return JSON.parse(sessionData)
  } catch (error) {
    console.error("Error parsing cached session:", error)
    return null
  }
}

// Rate limiting for API endpoints
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redis = getServerRedisClient()
  if (!redis) return { allowed: true, remaining: limit, reset: 0 }

  const now = Math.floor(Date.now() / 1000)
  const key = `ratelimit:${identifier}`

  // Get current count and expiry
  const [count, expiry] = await Promise.all([redis.get<number>(key) || 0, redis.ttl(key)])

  // Calculate reset time
  const reset = expiry > 0 ? now + expiry : now + windowSeconds

  // If no existing record or expired
  if (count === 0) {
    await redis.set(key, 1, { ex: windowSeconds })
    return { allowed: true, remaining: limit - 1, reset }
  }

  // If under limit
  if (count < limit) {
    await redis.incr(key)
    return { allowed: true, remaining: limit - count - 1, reset }
  }

  // Rate limited
  return { allowed: false, remaining: 0, reset }
}

// Faction statistics caching
export async function cacheFactionStats(stats: any): Promise<void> {
  const redis = getServerRedisClient()
  if (!redis) return

  await redis.set("faction:stats", JSON.stringify(stats), {
    ex: CACHE_TIMES.MEDIUM,
  })
}

export async function getFactionStats(): Promise<any | null> {
  const redis = getServerRedisClient()
  if (!redis) return null

  const stats = await redis.get<string>("faction:stats")
  if (!stats) return null

  try {
    return JSON.parse(stats)
  } catch (error) {
    console.error("Error parsing cached faction stats:", error)
    return null
  }
}

// Leaderboard functions using Redis sorted sets
export async function updateLeaderboardScore(leaderboardName: string, userId: string, score: number): Promise<boolean> {
  const redis = getServerRedisClient()
  if (!redis) return false

  try {
    await redis.zadd(leaderboardName, { score, member: userId })
    return true
  } catch (error) {
    console.error(`Error updating leaderboard ${leaderboardName}:`, error)
    return false
  }
}

export async function getLeaderboard(
  leaderboardName: string,
  start = 0,
  end = 9,
  withScores = true,
): Promise<Array<{ member: string; score: number }>> {
  const redis = getServerRedisClient()
  if (!redis) return []

  try {
    const results = await redis.zrange(leaderboardName, start, end, {
      withScores,
      rev: true, // Get highest scores first
    })

    // Format results into a more usable structure
    if (withScores && Array.isArray(results)) {
      const formatted = []
      for (let i = 0; i < results.length; i += 2) {
        formatted.push({
          member: results[i] as string,
          score: Number(results[i + 1]),
        })
      }
      return formatted
    }

    return []
  } catch (error) {
    console.error(`Error getting leaderboard ${leaderboardName}:`, error)
    return []
  }
}

// User online status tracking
export async function setUserOnline(userId: string, ttlSeconds = 300): Promise<boolean> {
  const redis = getServerRedisClient()
  if (!redis) return false

  try {
    await redis.set(`user:${userId}:online`, "1", { ex: ttlSeconds })
    await redis.sadd("users:online", userId)
    return true
  } catch (error) {
    console.error(`Error setting user ${userId} online:`, error)
    return false
  }
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const redis = getServerRedisClient()
  if (!redis) return false

  try {
    const status = await redis.get(`user:${userId}:online`)
    return status === "1"
  } catch (error) {
    console.error(`Error checking if user ${userId} is online:`, error)
    return false
  }
}

export async function getOnlineUsers(): Promise<string[]> {
  const redis = getServerRedisClient()
  if (!redis) return []

  try {
    return await redis.smembers("users:online")
  } catch (error) {
    console.error("Error getting online users:", error)
    return []
  }
}

// Distributed locking for critical operations
export async function acquireLock(lockName: string, ttlSeconds = 30): Promise<string | null> {
  const redis = getServerRedisClient()
  if (!redis) return null

  const lockId = Math.random().toString(36).substring(2, 15)
  const key = `lock:${lockName}`

  try {
    const acquired = await redis.set(key, lockId, {
      nx: true, // Only set if key doesn't exist
      ex: ttlSeconds,
    })

    return acquired ? lockId : null
  } catch (error) {
    console.error(`Error acquiring lock ${lockName}:`, error)
    return null
  }
}

export async function releaseLock(lockName: string, lockId: string): Promise<boolean> {
  const redis = getServerRedisClient()
  if (!redis) return false

  const key = `lock:${lockName}`

  try {
    // Only release if we own the lock
    const currentLockId = await redis.get<string>(key)
    if (currentLockId === lockId) {
      await redis.del(key)
      return true
    }
    return false
  } catch (error) {
    console.error(`Error releasing lock ${lockName}:`, error)
    return false
  }
}
