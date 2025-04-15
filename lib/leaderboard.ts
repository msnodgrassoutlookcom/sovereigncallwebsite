import { getRedisClient } from "./redis"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

interface LeaderboardEntry {
  userId: string
  score: number
  rank?: number
  username?: string
}

interface LeaderboardOptions {
  withScores?: boolean
  withRanks?: boolean
  reverse?: boolean // true for ascending order, false for descending
  limit?: number
  offset?: number
}

// Main leaderboard class with efficient operations
export class Leaderboard {
  private key: string

  constructor(name: string) {
    this.key = `leaderboard:${name}`
  }

  // Add or update score
  async addScore(userId: string, score: number): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      // ZADD with score - if user exists, score is updated
      await redis.zadd(this.key, { score, member: userId })
      return true
    } catch (error) {
      console.error(`Error adding score to leaderboard:`, error)
      return false
    }
  }

  // Increment score by amount
  async incrementScore(userId: string, increment: number): Promise<number> {
    const redis = getRedisClient()
    if (!redis) return 0

    try {
      // ZINCRBY adds increment to existing score (or 0 if user doesn't exist)
      const newScore = await redis.zincrby(this.key, increment, userId)
      return newScore
    } catch (error) {
      console.error(`Error incrementing score:`, error)
      return 0
    }
  }

  // Get user's rank (0-based)
  async getRank(userId: string): Promise<number | null> {
    const redis = getRedisClient()
    if (!redis) return null

    try {
      // ZREVRANK gives rank in descending order (highest first)
      const rank = await redis.zrevrank(this.key, userId)

      // If user not found, rank is null
      if (rank === null) return null

      // Add 1 to make it 1-based ranking
      return rank + 1
    } catch (error) {
      console.error(`Error getting rank:`, error)
      return null
    }
  }

  // Get top entries
  async getTopScores({
    limit = 10,
    offset = 0,
    withScores = true,
    withRanks = true,
    reverse = false,
  }: LeaderboardOptions = {}): Promise<LeaderboardEntry[]> {
    const redis = getRedisClient()
    if (!redis) return []

    try {
      // Get top scores (with or without user info)
      const result = reverse
        ? await redis.zrange(this.key, offset, offset + limit - 1, { withScores })
        : await redis.zrevrange(this.key, offset, offset + limit - 1, { withScores })

      return result.map((entry, index) => {
        const baseRank = offset + index + 1

        return {
          userId: typeof entry === "string" ? entry : entry.member,
          score: typeof entry === "string" ? 0 : entry.score,
          rank: withRanks ? baseRank : undefined,
        }
      })
    } catch (error) {
      console.error(`Error getting top scores:`, error)
      return []
    }
  }

  // Get multiple users' scores
  async getScores(userIds: string[]): Promise<Record<string, number>> {
    const redis = getRedisClient()
    if (!redis || userIds.length === 0) return {}

    try {
      // Use ZMSCORE to get multiple scores in one command
      const scores = await redis.zmscore(this.key, userIds)

      // Map user IDs to scores
      const result: Record<string, number> = {}
      for (let i = 0; i < userIds.length; i++) {
        result[userIds[i]] = scores[i] !== null ? scores[i] : 0
      }

      return result
    } catch (error) {
      console.error(`Error getting scores:`, error)
      return {}
    }
  }

  // Get scores around a user (useful for showing nearby competitors)
  async getScoresAround(userId: string, range = 5): Promise<LeaderboardEntry[]> {
    const redis = getRedisClient()
    if (!redis) return []

    try {
      // Get user's rank
      const rank = await redis.zrevrank(this.key, userId)
      if (rank === null) return []

      // Calculate range to fetch
      const start = Math.max(0, rank - range)
      const end = rank + range

      // Get scores in range
      const result = await redis.zrevrange(this.key, start, end, { withScores: true })

      return result.map((entry, index) => ({
        userId: entry.member,
        score: entry.score,
        rank: start + index + 1,
      }))
    } catch (error) {
      console.error(`Error getting scores around:`, error)
      return []
    }
  }

  // Remove user from leaderboard
  async removeUser(userId: string): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      await redis.zrem(this.key, userId)
      return true
    } catch (error) {
      console.error(`Error removing user:`, error)
      return false
    }
  }

  // Get total number of users in leaderboard
  async getCount(): Promise<number> {
    const redis = getRedisClient()
    if (!redis) return 0

    try {
      return await redis.zcard(this.key)
    } catch (error) {
      console.error(`Error getting count:`, error)
      return 0
    }
  }

  // Set expiry on the leaderboard (useful for seasonal/event leaderboards)
  async setExpiry(seconds: number): Promise<boolean> {
    const redis = getRedisClient()
    if (!redis) return false

    try {
      await redis.expire(this.key, seconds)
      return true
    } catch (error) {
      console.error(`Error setting expiry:`, error)
      return false
    }
  }
}

// Create leaderboard with populated user data
export async function getEnhancedLeaderboard(name: string, options: LeaderboardOptions = {}) {
  const leaderboard = new Leaderboard(name)
  const entries = await leaderboard.getTopScores(options)

  // Early return if no entries
  if (entries.length === 0) return entries

  // Get usernames for all user IDs
  try {
    const supabase = createServerSupabaseClient()
    const { data: users } = await supabase
      .from("users")
      .select("id, username")
      .in(
        "id",
        entries.map((entry) => entry.userId),
      )

    if (!users) return entries

    // Map of user ID to username
    const usernameMap = users.reduce(
      (acc, user) => {
        acc[user.id] = user.username
        return acc
      },
      {} as Record<string, string>,
    )

    // Add usernames to entries
    return entries.map((entry) => ({
      ...entry,
      username: usernameMap[entry.userId] || "Unknown",
    }))
  } catch (error) {
    console.error(`Error enhancing leaderboard:`, error)
    return entries
  }
}
