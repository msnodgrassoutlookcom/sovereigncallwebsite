import { NextResponse } from "next/server"
import { checkDatabaseConnection, checkDatabaseSchema } from "@/lib/db-check"
import { validateEnv, serverEnv, clientEnv } from "@/lib/env"
import { checkRedisConnection, performRedisHealthCheck } from "@/lib/redis"
import { getCacheStats } from "@/lib/cache"

export async function GET() {
  try {
    // Check environment variables
    const envValid = validateEnv()

    // Check database connection
    const dbConnection = await checkDatabaseConnection()

    // Check database schema
    const dbSchema = await checkDatabaseSchema()

    // Check Redis connection
    const redisStatus = await checkRedisConnection()

    // Detailed Redis health check
    const redisHealth = redisStatus.connected ? await performRedisHealthCheck() : null

    // Check email configuration
    const emailConfigured = Boolean(
      serverEnv.emailServerHost && serverEnv.emailServerUser && serverEnv.emailServerPassword,
    )

    // Mask sensitive information
    const maskedEnv = {
      server: {
        ...Object.fromEntries(
          Object.entries(serverEnv).map(([key, value]) => {
            // Mask passwords and tokens
            if (key.includes("password") || key.includes("key") || key.includes("token")) {
              return [key, value ? "******" : null]
            }
            return [key, value || null]
          }),
        ),
      },
      client: {
        ...Object.fromEntries(
          Object.entries(clientEnv).map(([key, value]) => {
            // Mask keys
            if (key.includes("key")) {
              return [key, value ? "******" : null]
            }
            return [key, value || null]
          }),
        ),
      },
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: {
        valid: envValid,
        masked: maskedEnv,
      },
      database: {
        connected: dbConnection.connected,
        connectionError: dbConnection.error,
        schemaValid: dbSchema.valid,
        schemaError: dbSchema.error,
      },
      redis: {
        configured: Boolean(serverEnv.redisUrl && serverEnv.redisToken),
        connected: redisStatus?.connected || false,
        latency: redisStatus?.latency || null,
        error: redisStatus?.error || null,
        health: redisHealth,
        cacheStats: getCacheStats(),
      },
      email: {
        configured: emailConfigured,
      },
    })
  } catch (error) {
    console.error("Diagnostics error:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
