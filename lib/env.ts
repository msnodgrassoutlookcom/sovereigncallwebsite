// Environment variables utility

// Server-side environment variables
export const serverEnv = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || "",

  // Email
  emailServerHost: process.env.EMAIL_SERVER_HOST || "",
  emailServerPort: Number.parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  emailServerUser: process.env.EMAIL_SERVER_USER || "",
  emailServerPassword: process.env.EMAIL_SERVER_PASSWORD || "",
  emailServerSecure: process.env.EMAIL_SERVER_SECURE === "true",
  emailFrom: process.env.EMAIL_FROM || "noreply@example.com",

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Blob
  blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || "",

  // Redis (Upstash)
  redisUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",

  // Redis configuration
  redisConnectionTimeout: Number.parseInt(process.env.REDIS_CONNECTION_TIMEOUT || "5000"),
  redisMaxRetries: Number.parseInt(process.env.REDIS_MAX_RETRIES || "3"),
  redisRetryBackoff: Number.parseInt(process.env.REDIS_RETRY_BACKOFF || "100"),
  redisEnableAutoPipelining: process.env.REDIS_ENABLE_AUTO_PIPELINING === "true",
}

// Client-side environment variables
export const clientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}

// Validation function to check if all required environment variables are set
export function validateEnv() {
  const requiredServerVars = [
    "supabaseUrl",
    "supabaseServiceKey",
    "emailServerHost",
    "emailServerUser",
    "emailServerPassword",
    "emailFrom",
    "blobReadWriteToken",
    "redisUrl",
    "redisToken",
  ]

  const requiredClientVars = ["supabaseUrl", "supabaseAnonKey", "appUrl"]

  const missingServerVars = requiredServerVars.filter((key) => !serverEnv[key as keyof typeof serverEnv])
  const missingClientVars = requiredClientVars.filter((key) => !clientEnv[key as keyof typeof clientEnv])

  if (missingServerVars.length > 0 || missingClientVars.length > 0) {
    console.warn("⚠️ Missing environment variables:")
    if (missingServerVars.length > 0) {
      console.warn("Server:", missingServerVars.join(", "))
    }
    if (missingClientVars.length > 0) {
      console.warn("Client:", missingClientVars.join(", "))
    }
    return false
  }

  return true
}
