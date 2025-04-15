import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"

export async function POST() {
  try {
    const redis = getRedisClient()
    if (!redis) {
      return NextResponse.json({ error: "Redis client not available" }, { status: 500 })
    }

    // Get all cache keys (use scan for production systems with large datasets)
    const keys = await redis.keys("cache:*")

    if (keys.length > 0) {
      // Delete all cache keys
      await redis.del(...keys)
    }

    // Also delete tag sets
    const tagKeys = await redis.keys("cache:tag:*")
    if (tagKeys.length > 0) {
      await redis.del(...tagKeys)
    }

    return NextResponse.json({
      success: true,
      keysInvalidated: keys.length + tagKeys.length,
    })
  } catch (error) {
    console.error("Error invalidating cache:", error)
    return NextResponse.json({ error: "Failed to invalidate cache" }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
