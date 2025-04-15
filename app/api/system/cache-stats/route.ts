import { NextResponse } from "next/server"
import { getCacheStats } from "@/lib/cache"
import { getRedisClient } from "@/lib/redis"

export async function GET() {
  try {
    // Get in-memory cache stats
    const localStats = getCacheStats()

    // Get Redis cache stats if available
    const redis = getRedisClient()
    let redisStats = null
    let historicalData = null

    if (redis) {
      // Get cached stats from Redis
      redisStats = {
        hits: Number((await redis.get("stats:cache:hits")) || 0),
        misses: Number((await redis.get("stats:cache:misses")) || 0),
      }

      // Calculate hit rate for Redis stats
      const total = redisStats.hits + redisStats.misses
      redisStats.hitRate = total > 0 ? Math.round((redisStats.hits / total) * 10000) / 100 : 0
      redisStats.total = total

      // Get historical data points for the chart
      // This data is stored every 5 minutes in Redis
      const historyPoints = await redis.lrange("stats:cache:history", 0, 23)

      if (historyPoints && historyPoints.length > 0) {
        historicalData = historyPoints
          .map((point) => {
            try {
              return JSON.parse(point)
            } catch (e) {
              return null
            }
          })
          .filter(Boolean)
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      local: localStats,
      redis: redisStats,
      historical: historicalData,
    })
  } catch (error) {
    console.error("Error fetching cache stats:", error)
    return NextResponse.json({ error: "Failed to fetch cache statistics" }, { status: 500 })
  }
}
