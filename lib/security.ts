import { createHash, randomBytes } from "crypto"
import { NextRequest, type NextResponse } from "next/server"
import { getRedisClient } from "./redis"
import { serverEnv } from "./env"
import { headers } from "next/headers"
import DOMPurify from "isomorphic-dompurify"

/**
 * Generate a secure random token
 * @param length Length of the token in bytes (output will be twice this length as hex)
 */
export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString("hex")
}

/**
 * Hash a string using SHA-256
 * @param input String to hash
 */
export function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex")
}

/**
 * Compare a string with a hash in constant time
 * @param input String to compare
 * @param hash Hash to compare against
 */
export function secureCompare(input: string, hash: string): boolean {
  const inputHash = hashString(input)

  // Constant time comparison to prevent timing attacks
  if (inputHash.length !== hash.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < inputHash.length; i++) {
    result |= inputHash.charCodeAt(i) ^ hash.charCodeAt(i)
  }

  return result === 0
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html HTML content to sanitize
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  })
}

/**
 * Generate a CSRF token and store it in Redis
 * @param userId User ID to associate with the token
 */
export async function generateCsrfToken(userId: string): Promise<string> {
  const token = generateSecureToken()
  const redis = getRedisClient()

  if (redis) {
    // Store token with 1 hour expiry
    await redis.set(`csrf:${userId}:${token}`, "1", { ex: 3600 })
  }

  return token
}

/**
 * Verify a CSRF token
 * @param userId User ID associated with the token
 * @param token CSRF token to verify
 */
export async function verifyCsrfToken(userId: string, token: string): Promise<boolean> {
  if (!token || !userId) return false

  const redis = getRedisClient()
  if (!redis) return false

  const isValid = await redis.get(`csrf:${userId}:${token}`)
  return isValid === "1"
}

/**
 * Add security headers to a response
 * @param response NextResponse object
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers

  // Set security headers
  headers.set("Content-Security-Policy", getContentSecurityPolicy())
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("X-Frame-Options", "DENY")
  headers.set("X-XSS-Protection", "1; mode=block")
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // If in production, set strict transport security
  if (process.env.NODE_ENV === "production") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
  }

  return response
}

/**
 * Get Content Security Policy
 */
function getContentSecurityPolicy(): string {
  const appUrl = serverEnv.appUrl

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Consider removing unsafe-inline/eval in production
    `connect-src 'self' ${appUrl} https://api.vercel.com https://*.supabase.co https://upload.vercel-blob.com`,
    "img-src 'self' data: blob: https://*.vercel-blob.com https://vercel.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

/**
 * Get client IP address from request
 * @param request NextRequest object
 */
export function getClientIp(request: NextRequest | Request): string {
  let ip: string | null

  if (request instanceof NextRequest) {
    ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
  } else {
    ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
  }

  return ip?.split(",")[0] || "unknown"
}

/**
 * Get client IP address from headers object
 */
export function getClientIpFromHeaders(): string {
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip")

  return ip?.split(",")[0] || "unknown"
}

/**
 * Validate and sanitize user input
 * @param input User input to validate
 * @param type Type of input to validate
 */
export function validateAndSanitize(input: string, type: "username" | "email" | "text" | "html"): string | null {
  if (!input) return null

  switch (type) {
    case "username":
      // Allow alphanumeric, underscore, hyphen, 3-30 chars
      return /^[a-zA-Z0-9_-]{3,30}$/.test(input) ? input : null

    case "email":
      // Basic email validation
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? input.toLowerCase() : null

    case "text":
      // Remove potentially dangerous characters
      return input.replace(/[<>]/g, "")

    case "html":
      // Sanitize HTML content
      return sanitizeHtml(input)

    default:
      return null
  }
}

/**
 * Detect and block suspicious activity
 * @param userId User ID
 * @param action Action being performed
 * @param ip Client IP address
 */
export async function detectSuspiciousActivity(userId: string, action: string, ip: string): Promise<boolean> {
  const redis = getRedisClient()
  if (!redis) return false

  const key = `security:activity:${userId}:${action}`
  const count = await redis.incr(key)

  // Set expiry if this is a new key
  if (count === 1) {
    await redis.expire(key, 3600) // 1 hour
  }

  // Log suspicious activity if threshold exceeded
  if (count > 10) {
    console.warn(`Suspicious activity detected: User ${userId} performed ${action} ${count} times from IP ${ip}`)

    // Store in suspicious activity log
    await redis.lpush(
      "security:suspicious",
      JSON.stringify({
        userId,
        action,
        ip,
        count,
        timestamp: Date.now(),
      }),
    )

    return true
  }

  return false
}
