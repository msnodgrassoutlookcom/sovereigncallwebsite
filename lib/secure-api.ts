import { NextResponse } from "next/server"
import { getClientIp, detectSuspiciousActivity } from "./security"
import { withCsrfProtection } from "./csrf-middleware"
import { withRateLimit } from "./rate-limit"
import { withPerformanceTracking } from "./performance-metrics"

/**
 * Create a secure API route handler
 * @param handler API route handler
 * @param options Options
 */
export function createSecureHandler(
  handler: (request: Request) => Promise<Response>,
  options: {
    requireAuth?: boolean
    csrfProtection?: boolean
    rateLimit?: {
      limit: number
      window: number
    }
    trackPerformance?: boolean
    operationName?: string
  } = {},
) {
  let secureHandler = handler

  // Add authentication check if required
  if (options.requireAuth) {
    secureHandler = async (request: Request) => {
      // Get session token from cookies
      const cookies = request.headers.get("cookie")
      if (!cookies) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      const cookiePairs = cookies.split(";").map((cookie) => cookie.trim().split("="))
      const sessionToken = cookiePairs.find((pair) => pair[0] === "sessionToken")?.[1]
      const userId = cookiePairs.find((pair) => pair[0] === "userId")?.[1]

      if (!sessionToken || !userId) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      // Call the handler if authentication check passes
      return handler(request)
    }
  }

  // Add CSRF protection if required
  if (options.csrfProtection) {
    secureHandler = withCsrfProtection(secureHandler)
  }

  // Add rate limiting if required
  if (options.rateLimit) {
    secureHandler = withRateLimit(secureHandler, {
      limit: options.rateLimit.limit,
      window: options.rateLimit.window,
    })
  }

  // Add performance tracking if required
  if (options.trackPerformance) {
    secureHandler = withPerformanceTracking(secureHandler, options.operationName || "api")
  }

  // Add security logging wrapper
  return async (request: Request) => {
    try {
      // Log API access (non-blocking)
      const ip = getClientIp(request)
      const path = new URL(request.url).pathname

      // Detect suspicious activity for sensitive endpoints
      if (path.includes("auth") || path.includes("admin") || path.includes("password") || request.method !== "GET") {
        // Use a generic ID for unauthenticated requests
        const cookies = request.headers.get("cookie")
        const cookiePairs = cookies ? cookies.split(";").map((cookie) => cookie.trim().split("=")) : []
        const userId = cookiePairs.find((pair) => pair[0] === "userId")?.[1] || ip

        // Detect suspicious activity (non-blocking)
        detectSuspiciousActivity(userId, `api:${path}:${request.method}`, ip).catch(console.error)
      }

      return secureHandler(request)
    } catch (error) {
      console.error("API error:", error)
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
    }
  }
}
