import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"

// This endpoint will be called by a cron job every 5 minutes
export async function POST(request: Request) {
  try {
    // Verify that this is an authorized request (optional security measure)
    const authHeader = request.headers.get("Authorization")
    const secretKey = process.env.CACHE_STATS_CRON_SECRET

    // Very basic auth check - in production you'd want something more robust
    if (secretKey && (!authHeader || authHeader !== `Bearer ${secretKey}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json({ error: "Redis not available" }, { status: 500 })
    }

    // Get current stats
    const hits = Number((await redis.get("stats:cache:hits")) || 0)
    const misses = Number((await redis.get("stats:cache:misses")) || 0)
    const total = hits + misses
    const hitRate = total > 0 ? Math.round((hits / total) * 10000) / 100 : 0

    // Create a data point with timestamp
    const dataPoint = {
      timestamp: Date.now(),
      hits,
      misses,
      total,
      hitRate,
    }

    // Add to the history list
    await redis.lpush("stats:cache:history", JSON.stringify(dataPoint))

    // Keep only the last 24 entries (2 hours if recorded every 5 minutes)
    await redis.ltrim("stats:cache:history", 0, 23)

    return NextResponse.json({
      success: true,
      recorded: dataPoint,
    })
  } catch (error) {
    console.error("Error recording cache history:", error)
    return NextResponse.json({ error: "Failed to record cache history" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
