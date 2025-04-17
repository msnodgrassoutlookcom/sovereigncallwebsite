import { cookies } from "next/headers"
import { getRedisClient } from "./redis"
import { verifySessionToken } from "./auth-utils"
import type { NextRequest } from "next/server"

/**
 * Get current user session from cookies
 */
export async function getSession(req?: NextRequest) {
  // Use cookies from request if provided, otherwise use headers API
  let sessionToken: string | undefined

  if (req) {
    // For middleware and API routes
    sessionToken = req.cookies.get("sessionToken")?.value
  } else {
    // For server components
    const cookieStore = cookies()
    sessionToken = cookieStore.get("sessionToken")?.value
  }

  if (!sessionToken) {
    return null
  }

  try {
    // Verify the session token
    const payload = await verifySessionToken(sessionToken)
    if (!payload || !payload.userId) {
      return null
    }

    // Get session data from Redis
    const redis = getRedisClient()
    if (redis) {
      const sessionKey = `session:user:${payload.userId}`
      const sessionData = await redis.get<string>(sessionKey)

      if (sessionData) {
        try {
          return JSON.parse(sessionData)
        } catch (error) {
          console.error("Error parsing session data:", error)
        }
      }
    }

    // Fallback to minimal session data if Redis is unavailable
    return {
      id: payload.userId,
      sessionExpiry: payload.exp,
    }
  } catch (error) {
    console.error("Error verifying session:", error)
    return null
  }
}

/**
 * Validate session and check permissions
 */
export async function validateSession(req: NextRequest, requiredRole?: string) {
  const session = await getSession(req)

  if (!session) {
    return { valid: false, reason: "no-session" }
  }

  // Check if session is expired
  if (session.sessionExpiry && session.sessionExpiry < Math.floor(Date.now() / 1000)) {
    return { valid: false, reason: "expired" }
  }

  // Check if required role is present
  if (requiredRole && session.role !== requiredRole && session.role !== "admin") {
    return { valid: false, reason: "insufficient-permissions" }
  }

  return { valid: true, session }
}

/**
 * Refresh session expiry
 */
export async function refreshSession(userId: string) {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const sessionKey = `session:user:${userId}`
    const sessionData = await redis.get<string>(sessionKey)

    if (sessionData) {
      // Parse the session data
      let sessionObj
      try {
        sessionObj = JSON.parse(sessionData)
      } catch (e) {
        console.error("Error parsing session data:", e)
        return false
      }

      // Update the expiry time
      const newExpiry = Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
      sessionObj.sessionExpiry = newExpiry

      // Save the updated session
      await redis.set(sessionKey, JSON.stringify(sessionObj), { ex: 86400 }) // 24 hours

      // Also update any related session tokens
      if (sessionObj.sessionToken) {
        await redis.expire(`auth:token:${sessionObj.sessionToken}`, 86400)
      }

      return true
    }

    return false
  } catch (error) {
    console.error("Error refreshing session:", error)
    return false
  }
}

/**
 * Destroy user session
 */
export async function destroySession(userId: string) {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    const sessionKey = `session:user:${userId}`
    await redis.del(sessionKey)
    return true
  } catch (error) {
    console.error("Error destroying session:", error)
    return false
  }
}

/**
 * Get all active sessions for a user
 */
export async function getUserActiveSessions(userId: string) {
  const redis = getRedisClient()
  if (!redis) return []

  try {
    const loginHistoryKey = `security:login:history:${userId}`
    const loginHistory = await redis.lrange(loginHistoryKey, 0, -1)

    return loginHistory
      .map((entry) => {
        try {
          return JSON.parse(entry)
        } catch {
          return null
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error("Error getting user sessions:", error)
    return []
  }
}

/**
 * Terminate all sessions for a user except the current one
 */
export async function terminateOtherSessions(userId: string, currentSessionId: string) {
  const redis = getRedisClient()
  if (!redis) return false

  try {
    // Keep only the current session
    const sessionKey = `session:user:${userId}`
    const sessionData = await redis.get<string>(sessionKey)

    if (sessionData) {
      const session = JSON.parse(sessionData)
      session.activeSessions = [currentSessionId]
      await redis.set(sessionKey, JSON.stringify(session), { ex: 86400 })
    }

    return true
  } catch (error) {
    console.error("Error terminating other sessions:", error)
    return false
  }
}
