import { NextResponse } from "next/server"
import { verifyCsrfToken } from "./security"

/**
 * Middleware to protect against CSRF attacks
 * @param handler API route handler
 */
export function withCsrfProtection(handler: Function) {
  return async (request: Request) => {
    // Skip CSRF check for GET requests
    if (request.method === "GET") {
      return handler(request)
    }

    // Get CSRF token from headers
    const csrfToken = request.headers.get("x-csrf-token")

    // Get user ID from cookies
    const cookies = request.headers.get("cookie")
    if (!cookies) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const cookiePairs = cookies.split(";").map((cookie) => cookie.trim().split("="))
    const userId = cookiePairs.find((pair) => pair[0] === "userId")?.[1]

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Verify CSRF token
    if (!csrfToken || !(await verifyCsrfToken(userId, csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 })
    }

    // Call the handler if CSRF check passes
    return handler(request)
  }
}
