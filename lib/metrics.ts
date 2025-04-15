import { getRedisClient } from "./redis"

// Metric types
type MetricType = "counter" | "gauge" | "histogram"

// Metric record
interface Metric {
  name: string
  type: MetricType
  value: number
  timestamp: number
  tags?: Record<string, string>
}

/**
 * Record a metric
 */
export async function recordMetric(
  name: string,
  value: number,
  type: MetricType = "gauge",
  tags: Record<string, string> = {},
): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  const metric: Metric = {
    name,
    type,
    value,
    timestamp: Date.now(),
    tags,
  }

  try {
    // Store in a time series list with automatic expiration
    const key = `metrics:${name}`
    await redis.lpush(key, JSON.stringify(metric))
    await redis.ltrim(key, 0, 999) // Keep last 1000 metrics
    await redis.expire(key, 60 * 60 * 24 * 7) // Expire after 1 week

    // For counters, also maintain a total
    if (type === "counter") {
      await redis.incrby(`metrics:total:${name}`, value)
    }

    return true
  } catch (error) {
    console.error(`Failed to record metric ${name}:`, error)
    return false
  }
}

/**
 * Get metrics for a specific name
 */
export async function getMetrics(name: string, limit = 100): Promise<Metric[]> {
  const redis = getRedisClient()
  if (!redis) return []

  try {
    const key = `metrics:${name}`
    const data = await redis.lrange(key, 0, limit - 1)
    return data.map((item) => JSON.parse(item))
  } catch (error) {
    console.error(`Failed to get metrics for ${name}:`, error)
    return []
  }
}

/**
 * Record cache hit/miss metrics
 */
export async function recordCacheMetric(hit: boolean, key: string): Promise<void> {
  const keyParts = key.split(":")
  const category = keyParts[0] || "unknown"

  await recordMetric("cache.access", 1, "counter", {
    result: hit ? "hit" : "miss",
    category,
  })
}

/**
 * Record API response time
 */
export async function recordResponseTime(path: string, timeMs: number): Promise<void> {
  await recordMetric("api.response_time", timeMs, "histogram", { path })
}

/**
 * Create a middleware to track API response times
 */
export function withResponseTimeMetrics(handler: Function) {
  return async (request: Request) => {
    const start = Date.now()
    const response = await handler(request)
    const timeMs = Date.now() - start

    // Extract path from URL
    const url = new URL(request.url)
    const path = url.pathname

    // Record metric in background (don't await)
    recordResponseTime(path, timeMs).catch(console.error)

    return response
  }
}
