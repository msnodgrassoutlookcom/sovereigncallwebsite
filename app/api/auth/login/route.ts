import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { verifyPassword, createSessionToken } from "@/lib/auth-utils"
import { cache, CACHE_TIMES } from "@/lib/cache"
import { getRedisClient } from "@/lib/redis"
import { getClientIp, detectSuspiciousActivity, validateAndSanitize, generateCsrfToken } from "@/lib/security"

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW = 15 * 60 // 15 minutes in seconds
const ACCOUNT_LOCKOUT_TIME = 30 * 60 // 30 minutes in seconds

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Sanitize username input
    const sanitizedUsername = validateAndSanitize(username, "username")
    if (!sanitizedUsername) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 })
    }

    // Get client IP for rate limiting
    const ip = getClientIp(request)

    // Check rate limiting with Redis
    const redis = getRedisClient()
    if (redis) {
      const rateLimitKey = `ratelimit:login:${ip}`
      const attempts = (await redis.get<number>(rateLimitKey)) || 0

      // Check if account is locked
      const accountLockKey = `security:account:locked:${sanitizedUsername}`
      const isLocked = await redis.get(accountLockKey)

      if (isLocked) {
        // Log suspicious activity
        await detectSuspiciousActivity(sanitizedUsername, "login:locked-account", ip)

        return NextResponse.json(
          {
            error: "Account is temporarily locked due to too many failed attempts. Please try again later.",
          },
          { status: 429 },
        )
      }

      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        return NextResponse.json(
          {
            error: "Too many login attempts. Please try again later.",
          },
          { status: 429 },
        )
      }

      // Increment attempt counter
      if (attempts === 0) {
        await redis.set(rateLimitKey, 1, { ex: LOGIN_WINDOW })
      } else {
        await redis.incr(rateLimitKey)
      }
    }

    // Get user with caching - normalize username for consistent cache keys
    const normalizedUsername = sanitizedUsername.toLowerCase()
    const cacheKey = `user:by-username:${normalizedUsername}`

    const user = await cache(
      cacheKey,
      async () => {
        const supabase = createServerSupabaseClient()

        // Find user by username
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .ilike("username", sanitizedUsername)
          .maybeSingle()

        if (userError) {
          console.error("Error fetching user:", userError)
          return null
        }

        return user
      },
      CACHE_TIMES.DAY, // Cache user data for a day
      { tags: ["users", `user:${normalizedUsername}`] },
    )

    // If user not found, return error
    if (!user) {
      // Increment failed attempts counter for this username
      if (redis) {
        const failedAttemptsKey = `security:login:failed:${sanitizedUsername}`
        const failedAttempts = await redis.incr(failedAttemptsKey)
        await redis.expire(failedAttemptsKey, LOGIN_WINDOW)

        // Log suspicious activity
        await detectSuspiciousActivity(sanitizedUsername, "login:user-not-found", ip)
      }

      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Compare passwords
    let passwordMatch = false

    try {
      passwordMatch = await verifyPassword(password, user.password)
    } catch (bcryptError) {
      console.error("Password verification error:", bcryptError)
      return NextResponse.json({ error: "Authentication error" }, { status: 500 })
    }

    if (!passwordMatch) {
      // Increment failed attempts counter for this username
      if (redis) {
        const failedAttemptsKey = `security:login:failed:${sanitizedUsername}`
        const failedAttempts = await redis.incr(failedAttemptsKey)
        await redis.expire(failedAttemptsKey, LOGIN_WINDOW)

        // If too many failed attempts, lock the account temporarily
        if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
          const accountLockKey = `security:account:locked:${sanitizedUsername}`
          await redis.set(accountLockKey, "1", { ex: ACCOUNT_LOCKOUT_TIME })

          // Log suspicious activity
          await detectSuspiciousActivity(sanitizedUsername, "login:account-locked", ip)
        }

        // Log suspicious activity
        await detectSuspiciousActivity(sanitizedUsername, "login:wrong-password", ip)
      }

      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    // Reset rate limit counter on successful login
    if (redis) {
      const rateLimitKey = `ratelimit:login:${ip}`
      await redis.del(rateLimitKey)

      // Clear failed attempts counter
      const failedAttemptsKey = `security:login:failed:${sanitizedUsername}`
      await redis.del(failedAttemptsKey)
    }

    // Create session token
    const sessionToken = await createSessionToken(user.id)

    // Generate CSRF token
    const csrfToken = await generateCsrfToken(user.id)

    // Get user's characters with caching
    const characters = await cache(
      `user:${user.id}:characters`,
      async () => {
        const supabase = createServerSupabaseClient()
        const { data: characters, error: charactersError } = await supabase
          .from("characters")
          .select("*")
          .eq("user_id", user.id)

        if (charactersError) {
          console.error("Error fetching characters:", charactersError)
          return []
        }

        return characters || []
      },
      CACHE_TIMES.MEDIUM, // Cache for a moderate time
      { tags: [`user:${user.id}`, "characters"] },
    )

    // Cache the full session data in Redis for quick access
    if (redis) {
      const sessionKey = `session:user:${user.id}`
      const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email,
        profilePictureUrl: user.profile_picture_url,
        role: user.role,
        emailVerified: user.email_verified,
        lastLogin: new Date().toISOString(),
        csrfToken,
      }

      // Store session data with 24 hour expiry
      await redis.set(sessionKey, JSON.stringify(sessionData), { ex: 86400 })

      // Log successful login
      await redis.lpush(
        `security:login:history:${user.id}`,
        JSON.stringify({
          timestamp: Date.now(),
          ip,
          userAgent: request.headers.get("user-agent") || "unknown",
        }),
      )

      // Keep only last 10 logins
      await redis.ltrim(`security:login:history:${user.id}`, 0, 9)
    }

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profilePictureUrl: user.profile_picture_url,
          role: user.role,
          emailVerified: user.email_verified,
          characters: characters || [],
          csrfToken,
        },
      },
      { status: 200 },
    )

    // Set secure HTTP-only cookie for session
    response.cookies.set({
      name: "sessionToken",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    // Set user ID cookie (not HTTP-only, for client-side access)
    response.cookies.set({
      name: "userId",
      value: user.id,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}
