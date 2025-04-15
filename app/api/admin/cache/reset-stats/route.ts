import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { resetCacheStats } from "@/lib/cache"

export async function POST() {
  try {
    // Reset local cache stats
    resetCacheStats()

    // Reset Redis cache stats
    const redis = getRedisClient()
    if (redis) {
      await redis.set("stats:cache:hits", 0)
      await redis.set("stats:cache:misses", 0)
    }

    return NextResponse.json({
      success: true,
      message: "Cache statistics reset successfully",
    })
  } catch (error) {
    console.error("Error resetting cache stats:", error)
    return NextResponse.json({ error: "Failed to reset cache statistics" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
