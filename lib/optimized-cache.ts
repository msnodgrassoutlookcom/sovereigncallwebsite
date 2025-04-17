import { kv } from "@vercel/kv"

// Cache times in seconds
export const CACHE_TIMES = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 1 day
}

// Content-based cache keys for better hit rates
export function generateCacheKey(data: any, prefix = ""): string {
  // Create a deterministic hash from the data
  const hash = createObjectHash(data)
  return `${prefix}:${hash}`
}

// Optimized cache function with SWR pattern
export async function cacheSWR<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = CACHE_TIMES.MEDIUM,
  options: { tags?: string[] } = {},
): Promise<T> {
  try {
    // Try to get from cache first
    const cachedData = await kv.get(key)

    if (cachedData !== null) {
      // Data exists in cache

      // Check if we need to refresh in background (SWR)
      const metadata = (await kv.get(`${key}:meta`)) as { lastUpdated?: number } | null
      const now = Date.now()

      if (metadata && metadata.lastUpdated && now - metadata.lastUpdated > ttl * 500) {
        // Refresh in background if half the TTL has passed
        refreshCache(key, fn, ttl, options).catch(console.error)
      }

      return cachedData as T
    }

    // Cache miss, get fresh data
    return refreshCache(key, fn, ttl, options)
  } catch (error) {
    console.error(`Cache error for key ${key}:`, error)
    // On error, fall back to direct function call
    return fn()
  }
}

// Helper function to refresh cache
async function refreshCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number,
  options: { tags?: string[] } = {},
): Promise<T> {
  const data = await fn()

  // Store in cache with TTL
  await kv.set(key, data, { ex: ttl })

  // Store metadata
  await kv.set(
    `${key}:meta`,
    {
      lastUpdated: Date.now(),
      tags: options.tags || [],
    },
    { ex: ttl },
  )

  // Update tag indices for cache invalidation
  if (options.tags && options.tags.length > 0) {
    for (const tag of options.tags) {
      await kv.sadd(`tag:${tag}`, key)
    }
  }

  return data
}

// Invalidate cache by key
export async function invalidateCache(key: string): Promise<void> {
  try {
    // Get metadata to find tags
    const metadata = (await kv.get(`${key}:meta`)) as { tags?: string[] } | null

    // Delete the cache entry
    await kv.del(key)
    await kv.del(`${key}:meta`)

    // Remove from tag indices
    if (metadata && metadata.tags) {
      for (const tag of metadata.tags) {
        await kv.srem(`tag:${tag}`, key)
      }
    }
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error)
  }
}

// Invalidate cache by tag
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    // Get all keys with this tag
    const keys = (await kv.smembers(`tag:${tag}`)) as string[]

    // Invalidate each key
    for (const key of keys) {
      await invalidateCache(key)
    }

    // Delete the tag set
    await kv.del(`tag:${tag}`)
  } catch (error) {
    console.error(`Error invalidating cache by tag ${tag}:`, error)
  }
}

// Helper to create a deterministic hash from an object
function createObjectHash(obj: any): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort())
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
