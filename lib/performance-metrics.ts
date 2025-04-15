import { getRedisClient } from "./redis"

interface TimingData {
  operation: string
  duration: number
  timestamp: number
  metadata?: Record<string, string | number | boolean>
}

// Collect performance metrics in Redis
export async function recordTiming(data: TimingData): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const { operation, duration, timestamp = Date.now(), metadata = {} } = data

    // Store timing in a sorted set for easy retrieval by time range
    // Key format: perf:timings:{operation}
    const key = `perf:timings:${operation}`
    const id = `${timestamp}:${Math.random().toString(36).substring(2, 10)}`

    // Add to sorted set with score as timestamp
    await redis.zadd(key, { score: timestamp, member: id })

    // Store detailed data in a hash
    const dataKey = `perf:data:${id}`
    const hashData = {
      operation,
      duration: duration.toString(),
      timestamp: timestamp.toString(),
      ...Object.entries(metadata).reduce(
        (acc, [k, v]) => {
          acc[k] = String(v)
          return acc
        },
        {} as Record<string, string>,
      ),
    }

    await redis.hset(dataKey, hashData)

    // Set expiry for data (7 days)
    await redis.expire(dataKey, 7 * 24 * 60 * 60)

    // Trim sorted sets to keep only last 1000 entries
    if (Math.random() < 0.1) {
      // Only do this occasionally to avoid overhead
      await redis.zremrangebyrank(key, 0, -1001)
    }

    // Update summary statistics
    await updateTimingSummary(operation, duration)

    return true
  } catch (error) {
    console.error(`Error recording timing:`, error)
    return false
  }
}

// Update summary statistics
async function updateTimingSummary(operation: string, duration: number): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const summaryKey = `perf:summary:${operation}`

    // Use Redis to track min, max, sum, and count
    await redis.hincrbyfloat(summaryKey, "sum", duration)
    await redis.hincrby(summaryKey, "count", 1)

    // Update minimum if needed
    const currentMin = await redis.hget(summaryKey, "min")
    if (!currentMin || duration < Number.parseFloat(currentMin)) {
      await redis.hset(summaryKey, { min: duration.toString() })
    }

    // Update maximum if needed
    const currentMax = await redis.hget(summaryKey, "max")
    if (!currentMax || duration > Number.parseFloat(currentMax)) {
      await redis.hset(summaryKey, { max: duration.toString() })
    }

    // Set expiry (refreshed on each update)
    await redis.expire(summaryKey, 30 * 24 * 60 * 60) // 30 days
  } catch (error) {
    console.error(`Error updating timing summary:`, error)
  }
}

// Get summary statistics
export async function getTimingSummary(operation: string): Promise<{
  min: number
  max: number
  avg: number
  count: number
  p95?: number
} | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const summaryKey = `perf:summary:${operation}`
    const summary = await redis.hgetall(summaryKey)

    if (!summary || Object.keys(summary).length === 0) {
      return null
    }

    const min = Number.parseFloat(summary.min || "0")
    const max = Number.parseFloat(summary.max || "0")
    const sum = Number.parseFloat(summary.sum || "0")
    const count = Number.parseInt(summary.count || "0", 10)

    const avg = count > 0 ? sum / count : 0

    // Calculate p95 if we have recent timings
    let p95: number | undefined
    try {
      const timingsKey = `perf:timings:${operation}`
      const recentTimings = await redis.zrevrange(timingsKey, 0, 99, { withScores: false })

      if (recentTimings.length >= 20) {
        // Get durations for recent entries
        const durations = await Promise.all(
          recentTimings.map(async (id) => {
            const data = await redis.hget(`perf:data:${id}`, "duration")
            return data ? Number.parseFloat(data) : 0
          }),
        )

        // Sort durations
        durations.sort((a, b) => a - b)

        // Calculate p95
        const p95Index = Math.floor(durations.length * 0.95)
        p95 = durations[p95Index]
      }
    } catch (error) {
      console.error(`Error calculating p95:`, error)
    }

    return { min, max, avg, count, p95 }
  } catch (error) {
    console.error(`Error getting timing summary:`, error)
    return null
  }
}

// Create middleware to track API response times
export function withPerformanceTracking(handler: Function, operation: string) {
  return async (request: Request) => {
    const start = Date.now()
    const response = await handler(request)
    const duration = Date.now() - start

    // Extract path from URL
    const url = new URL(request.url)
    const path = url.pathname

    // Record timing in background (don't await)
    recordTiming({
      operation,
      duration,
      timestamp: Date.now(),
      metadata: {
        path,
        method: request.method,
        status: response.status,
      },
    }).catch(console.error)

    return response
  }
}
