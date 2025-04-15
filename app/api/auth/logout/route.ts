import { NextResponse } from "next/server"
import { verifySessionToken, invalidateAllSessions } from "@/lib/auth-utils"
import { getRedisClient } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    // Get session token from cookies
    const cookies = request.headers.get("cookie")
    if (!cookies) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const cookiePairs = cookies.split(";").map((cookie) => cookie.trim().split("="))
    const sessionToken = cookiePairs.find((pair) => pair[0] === "sessionToken")?.[1]
    const userId = cookiePairs.find((pair) => pair[0] === "userId")?.[1]

    if (!sessionToken || !userId) {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Verify session token
    const isValid = await verifySessionToken(userId, sessionToken)

    if (isValid) {
      // Invalidate all sessions for this user
      await invalidateAllSessions(userId)

      // Clear Redis session data
      const redis = getRedisClient()
      if (redis) {
        await redis.del(`session:user:${userId}`)
      }
    }

    // Create response
    const response = NextResponse.json({ success: true }, { status: 200 })

    // Clear cookies
    response.cookies.set({
      name: "sessionToken",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })

    response.cookies.set({
      name: "userId",
      value: "",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 })
  }
}
