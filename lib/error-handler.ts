import { NextResponse } from "next/server"
import { getRedisClient } from "./redis"
import { getClientIp } from "./security"

// Error types
export enum ErrorType {
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  RATE_LIMIT = "rate_limit",
  SERVER = "server",
}

// Error response structure
interface ErrorResponse {
  error: string
  type: ErrorType
  details?: any
  code?: string
}

/**
 * Create a standardized error response
 * @param type Error type
 * @param message Error message
 * @param details Additional details
 * @param code Error code
 */
export function createErrorResponse(
  type: ErrorType,
  message: string,
  details?: any,
  code?: string,
): NextResponse<ErrorResponse> {
  const statusCodes: Record<ErrorType, number> = {
    [ErrorType.VALIDATION]: 400,
    [ErrorType.AUTHENTICATION]: 401,
    [ErrorType.AUTHORIZATION]: 403,
    [ErrorType.NOT_FOUND]: 404,
    [ErrorType.CONFLICT]: 409,
    [ErrorType.RATE_LIMIT]: 429,
    [ErrorType.SERVER]: 500,
  }

  const response: ErrorResponse = {
    error: message,
    type,
  }

  if (details) {
    response.details = details
  }

  if (code) {
    response.code = code
  }

  return NextResponse.json(response, { status: statusCodes[type] })
}

/**
 * Log error to Redis
 * @param error Error object
 * @param request Request object
 */
export async function logError(error: Error, request: Request): Promise<void> {
  const redis = getRedisClient()
  if (!redis) return

  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: Date.now(),
    }

    // Add to error log
    await redis.lpush("errors:log", JSON.stringify(errorData))

    // Keep only last 1000 errors
    await redis.ltrim("errors:log", 0, 999)

    // Increment error counter
    await redis.incr("errors:count")
  } catch (logError) {
    console.error("Error logging error:", logError)
  }
}

/**
 * Handle API errors
 * @param error Error object
 * @param request Request object
 */
export function handleApiError(error: any, request: Request): NextResponse {
  // Log error
  console.error("API error:", error)
  logError(error instanceof Error ? error : new Error(String(error)), request)

  // Return appropriate error response
  if (error.type && Object.values(ErrorType).includes(error.type)) {
    return createErrorResponse(error.type, error.message, error.details, error.code)
  }

  // Default to server error
  return createErrorResponse(
    ErrorType.SERVER,
    "An unexpected error occurred",
    process.env.NODE_ENV === "development" ? String(error) : undefined,
  )
}
