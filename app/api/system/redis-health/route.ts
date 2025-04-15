import { NextResponse } from "next/server"
import { checkRedisConnection, performRedisHealthCheck, getRedisClient } from "@/lib/redis"

export async function GET() {
  try {
    // Basic connection check
    const connectionStatus = await checkRedisConnection()

    // If not connected, return early with error
    if (!connectionStatus.connected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Redis connection failed",
          details: connectionStatus,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Detailed health check
    const healthCheck = await performRedisHealthCheck()

    // Get some basic stats if available
    const redis = getRedisClient()
    let stats = null

    if (redis) {
      try {
        // Get hit rate for cache keys
        const cacheHits = (await redis.get("stats:cache:hits")) || 0
        const cacheMisses = (await redis.get("stats:cache:misses")) || 0
        const totalRequests = Number(cacheHits) + Number(cacheMisses)
        const hitRate = totalRequests > 0 ? (Number(cacheHits) / totalRequests) * 100 : 0

        stats = {
          cacheHits,
          cacheMisses,
          hitRate: Math.round(hitRate * 100) / 100, // Round to 2 decimal places
          totalRequests,
        }
      } catch (statsError) {
        console.error("Error fetching Redis stats:", statsError)
      }
    }

    return NextResponse.json({
      status: "success",
      connection: connectionStatus,
      health: healthCheck,
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Redis health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
