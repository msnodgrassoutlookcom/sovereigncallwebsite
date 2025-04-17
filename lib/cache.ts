import { getRedisClient } from "./redis"

// Cache expiration times (in seconds)
export const CACHE_TIMES = {
  TINY: 10, // 10 seconds
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 1 day
  WEEK: 604800, // 1 week
}

interface CacheOptions {
  tags?: string[]
  staleWhileRevalidate?: boolean
}

/**
 * Generic cache function that wraps any async function with Redis caching
 *
 * @param key - Redis cache key
 * @param fn - Async function to execute if cache miss
 * @param ttl - Cache TTL in seconds
 * @param options - Additional cache options
 * @param forceFresh - Force fresh data fetch, ignoring cache
 */
export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TIMES.MEDIUM,
  options: CacheOptions = {},
  forceFresh = false,
): Promise<T> {
  const redis = getRedisClient()

  // If Redis is not available, execute function directly
  if (!redis) return fn()

  // If forceFresh is true, skip cache lookup
  if (!forceFresh) {
    try {
      // Try to get from cache
      const cached = await redis.get<T>(key)
      if (cached !== null) {
        cacheStats.hits++
        // Increment hit counter in Redis (non-blocking)
        redis.incr("stats:cache:hits").catch(console.error)

        // If stale-while-revalidate is enabled, refresh the cache in the background
        if (options.staleWhileRevalidate) {
          refreshCacheInBackground(key, fn, ttl, options).catch(console.error)
        }

        return cached
      }
    } catch (error) {
      console.error(`Cache error for key ${key}:`, error)
      cacheStats.errors++
      // Continue to fetch fresh data on cache error
    }
  }

  cacheStats.misses++
  // Increment miss counter in Redis (non-blocking)
  if (redis) {
    redis.incr("stats:cache:misses").catch(console.error)
  }

  // Cache miss or forceFresh, execute function
  const result = await fn()

  // Store in cache if we have a result
  if (result !== null && result !== undefined && redis) {
    try {
      await redis.set(key, result, { ex: ttl })

      // If tags are provided, add this key to tag sets for easier invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await redis.sadd(`cache:tag:${tag}`, key)
        }
      }
    } catch (error) {
      console.error(`Failed to set cache for key ${key}:`, error)
      cacheStats.errors++
      // Non-blocking, continue even if cache set fails
    }
  }

  return result
}

/**
 * Refresh cache in the background (stale-while-revalidate pattern)
 */
async function refreshCacheInBackground<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number,
  options: CacheOptions = {},
): Promise<void> {
  try {
    const result = await fn()
    const redis = getRedisClient()

    if (result !== null && result !== undefined && redis) {
      await redis.set(key, result, { ex: ttl })

      // Update tags if provided
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await redis.sadd(`cache:tag:${tag}`, key)
        }
      }
    }
  } catch (error) {
    console.error(`Failed to refresh cache for key ${key}:`, error)
  }
}

/**
 * Invalidate a cache key
 */
export async function invalidateCache(key: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Failed to invalidate cache for key ${key}:`, error)
    return false
  }
}

/**
 * Invalidate multiple cache keys by pattern
 * @param pattern - Redis key pattern with * wildcard
 */
export async function invalidateCachePattern(pattern: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error(`Failed to invalidate cache pattern ${pattern}:`, error)
    return false
  }
}

/**
 * Invalidate cache by tag
 * @param tag - Cache tag to invalidate
 */
export async function invalidateCacheByTag(tag: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    // Get all keys with this tag
    const keys = await redis.smembers(`cache:tag:${tag}`)

    if (keys.length > 0) {
      // Delete all keys
      await redis.del(...keys)
      // Remove the tag set
      await redis.del(`cache:tag:${tag}`)
    }

    return true
  } catch (error) {
    console.error(`Failed to invalidate cache by tag ${tag}:`, error)
    return false
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const total = cacheStats.hits + cacheStats.misses
  const hitRate = total > 0 ? (cacheStats.hits / total) * 100 : 0

  return {
    ...cacheStats,
    total,
    hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
  }
}

/**
 * Reset cache statistics
 */
export function resetCacheStats() {
  cacheStats.hits = 0
  cacheStats.misses = 0
  cacheStats.errors = 0
}

/**
 * Cache with namespace support for better organization
 */
export function namespaceCache(namespace: string) {
  return {
    async get<T>(
      key: string,
      fn: () => Promise<T>,
      ttl = CACHE_TIMES.MEDIUM,
      options: CacheOptions = {},
      forceFresh = false,
    ): Promise<T> {
      return cache<T>(`${namespace}:${key}`, fn, ttl, options, forceFresh)
    },
    async invalidate(key: string): Promise<boolean> {
      return invalidateCache(`${namespace}:${key}`)
    },
    async invalidatePattern(pattern: string): Promise<boolean> {
      return invalidateCachePattern(`${namespace}:${pattern}`)
    },
    async invalidateAll(): Promise<boolean> {
      return invalidateCachePattern(`${namespace}:*`)
    },
    async invalidateByTag(tag: string): Promise<boolean> {
      return invalidateCacheByTag(`${namespace}:${tag}`)
    },
  }
}
