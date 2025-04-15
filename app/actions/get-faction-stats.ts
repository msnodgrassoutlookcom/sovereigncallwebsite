"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { cache, CACHE_TIMES } from "@/lib/cache"
import { getServerRedisClient } from "@/lib/redis"
import { recordMetric } from "@/lib/metrics"

export type FactionStats = {
  dominion: number
  reformation: number
  neutral: number
  total: number
  dominion_percentage: number
  reformation_percentage: number
  neutral_percentage: number
  timestamp: string
}

export async function getFactionStats(): Promise<FactionStats> {
  return cache(
    "faction:stats",
    async () => {
      const startTime = Date.now()

      try {
        const supabase = createServerSupabaseClient()

        // Use parallel queries for better performance
        const [dominionResult, reformationResult, neutralResult] = await Promise.all([
          supabase.from("characters").select("*", { count: "exact", head: true }).eq("faction", "dominion"),

          supabase.from("characters").select("*", { count: "exact", head: true }).eq("faction", "reformation"),

          supabase.from("characters").select("*", { count: "exact", head: true }).is("faction", null),
        ])

        const dominionCount = dominionResult.count || 0
        const reformationCount = reformationResult.count || 0
        const neutralCount = neutralResult.count || 0

        const total = dominionCount + reformationCount + neutralCount

        // Calculate percentages
        const dominion_percentage = total > 0 ? (dominionCount / total) * 100 : 0
        const reformation_percentage = total > 0 ? (reformationCount / total) * 100 : 0
        const neutral_percentage = total > 0 ? (neutralCount / total) * 100 : 0

        const result = {
          dominion: dominionCount,
          reformation: reformationCount,
          neutral: neutralCount,
          total,
          dominion_percentage,
          reformation_percentage,
          neutral_percentage,
          timestamp: new Date().toISOString(),
        }

        // Store metrics for this expensive operation
        const duration = Date.now() - startTime
        recordMetric("faction_stats.query_time", duration, "histogram").catch(console.error)

        // Store faction ratio for historical tracking
        const redis = getServerRedisClient()
        if (redis && total > 0) {
          const timestamp = Math.floor(Date.now() / 1000)
          await redis.zadd("faction:history:dominion", {
            score: timestamp,
            member: dominion_percentage.toFixed(2),
          })
          await redis.zadd("faction:history:reformation", {
            score: timestamp,
            member: reformation_percentage.toFixed(2),
          })

          // Trim to last 100 data points
          await redis.zremrangebyrank("faction:history:dominion", 0, -101)
          await redis.zremrangebyrank("faction:history:reformation", 0, -101)

          // Set expiry on historical data (30 days)
          await redis.expire("faction:history:dominion", 30 * 24 * 60 * 60)
          await redis.expire("faction:history:reformation", 30 * 24 * 60 * 60)
        }

        return result
      } catch (error) {
        console.error("Error in getFactionStats:", error)

        // Return default values if there's an error
        return {
          dominion: 0,
          reformation: 0,
          neutral: 0,
          total: 0,
          dominion_percentage: 0,
          reformation_percentage: 0,
          neutral_percentage: 0,
          timestamp: new Date().toISOString(),
        }
      }
    },
    CACHE_TIMES.MEDIUM, // Cache for 5 minutes
    {
      tags: ["faction-stats"],
      staleWhileRevalidate: true, // Keep serving stale data while fetching new data
    },
  )
}

// New function to get faction history for trends analysis
export async function getFactionHistory(days = 7): Promise<{
  dominion: Array<{ timestamp: number; value: number }>
  reformation: Array<{ timestamp: number; value: number }>
}> {
  const redis = getServerRedisClient()

  if (!redis) {
    return { dominion: [], reformation: [] }
  }

  try {
    // Calculate time range (in seconds)
    const now = Math.floor(Date.now() / 1000)
    const start = now - days * 24 * 60 * 60

    // Get historical data with scores (timestamps)
    const [dominionData, reformationData] = await Promise.all([
      redis.zrangebyscore("faction:history:dominion", start, "+inf", { WITHSCORES: true }),
      redis.zrangebyscore("faction:history:reformation", start, "+inf", { WITHSCORES: true }),
    ])

    // Format data for frontend use
    const formatData = (data: Array<{ score: string; member: string }>) => {
      return data.map((item) => ({
        timestamp: Number.parseInt(item.score),
        value: Number.parseFloat(item.member),
      }))
    }

    return {
      dominion: formatData(dominionData),
      reformation: formatData(reformationData),
    }
  } catch (error) {
    console.error("Error fetching faction history:", error)
    return { dominion: [], reformation: [] }
  }
}
