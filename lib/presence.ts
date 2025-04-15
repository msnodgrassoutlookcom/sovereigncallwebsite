import { getRedisClient } from "./redis"

interface UserPresence {
  userId: string
  status: "online" | "away" | "offline"
  lastSeen: number
  metadata?: Record<string, any>
}

// Set user presence
export async function setUserPresence(
  userId: string,
  status: "online" | "away" | "offline" = "online",
  metadata: Record<string, any> = {},
): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const now = Date.now()

    // Store presence data in hash
    const presenceKey = `presence:user:${userId}`
    await redis.hset(presenceKey, {
      userId,
      status,
      lastSeen: now.toString(),
      metadata: JSON.stringify(metadata),
    })

    // Set expiry based on status
    if (status === "online") {
      // Online users expire after 5 minutes if not updated
      await redis.expire(presenceKey, 300)
    } else if (status === "away") {
      // Away users expire after 30 minutes
      await redis.expire(presenceKey, 1800)
    } else {
      // Offline users expire after 24 hours
      await redis.expire(presenceKey, 86400)
    }

    // Add to sorted set for quick retrieval of online users
    if (status !== "offline") {
      await redis.zadd("presence:online", { score: now, member: userId })
    } else {
      // Remove from online users
      await redis.zrem("presence:online", userId)
    }

    return true
  } catch (error) {
    console.error(`Error setting user presence:`, error)
    return false
  }
}

// Get user presence
export async function getUserPresence(userId: string): Promise<UserPresence | null> {
  const redis = getRedisClient()
  if (!redis) return null

  try {
    const presenceKey = `presence:user:${userId}`
    const data = await redis.hgetall(presenceKey)

    if (!data || Object.keys(data).length === 0) {
      return null
    }

    return {
      userId: data.userId,
      status: data.status as "online" | "away" | "offline",
      lastSeen: Number.parseInt(data.lastSeen),
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
    }
  } catch (error) {
    console.error(`Error getting user presence:`, error)
    return null
  }
}

// Get all online users
export async function getOnlineUsers(): Promise<string[]> {
  const redis = getRedisClient()
  if (!redis) return []

  try {
    // Get all users with "online" status from sorted set
    const now = Date.now()
    const fiveMinutesAgo = now - 5 * 60 * 1000

    // Get users who have been active in the last 5 minutes
    const onlineUsers = await redis.zrangebyscore("presence:online", fiveMinutesAgo, "+inf")
    return onlineUsers
  } catch (error) {
    console.error(`Error getting online users:`, error)
    return []
  }
}

// Update user's last seen timestamp
export async function updateUserLastSeen(userId: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const now = Date.now()
    const presenceKey = `presence:user:${userId}`

    // Update last seen timestamp
    await redis.hset(presenceKey, { lastSeen: now.toString() })

    // Update score in sorted set
    await redis.zadd("presence:online", { score: now, member: userId })

    // Reset expiry
    await redis.expire(presenceKey, 300)

    return true
  } catch (error) {
    console.error(`Error updating user last seen:`, error)
    return false
  }
}
