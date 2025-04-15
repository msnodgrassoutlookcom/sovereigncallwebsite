import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { addSecurityHeaders, getClientIp, detectSuspiciousActivity } from "./lib/security"

export async function middleware(request: NextRequest) {
  // Check if we're missing critical environment variables
  const missingVars = []

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  // If we're missing variables and not already on the setup page
  if (missingVars.length > 0 && !request.nextUrl.pathname.startsWith("/setup")) {
    // Create a URL for the setup page
    const setupUrl = new URL("/setup", request.url)

    // Add the missing variables as a query parameter
    setupUrl.searchParams.set("missing", missingVars.join(","))

    // Redirect to the setup page
    return NextResponse.redirect(setupUrl)
  }

  // Get response from next middleware or route handler
  const response = NextResponse.next()

  // Add security headers
  const secureResponse = addSecurityHeaders(response)

  // Check for suspicious activity on sensitive routes
  const path = request.nextUrl.pathname
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/api/admin") ||
    path.includes("password") ||
    path.includes("login") ||
    path.includes("register")
  ) {
    const ip = getClientIp(request)

    // Use a generic ID for unauthenticated requests
    const userId = request.cookies.get("userId")?.value || ip

    // Detect suspicious activity (non-blocking)
    detectSuspiciousActivity(userId, `access:${path}`, ip).catch(console.error)
  }

  return secureResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - setup page (to avoid redirect loops)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|setup).*)",
  ],
}
