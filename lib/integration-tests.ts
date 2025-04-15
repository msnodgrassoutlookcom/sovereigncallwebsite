import { checkDatabaseConnection, checkDatabaseSchema } from "./db-check"
import { checkSupabaseConnection } from "./supabase"
import { checkRedisConnection, performRedisHealthCheck } from "./redis-utils"
import { put, del, list } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

/**
 * Test Supabase connection and functionality
 */
export async function testSupabase() {
  try {
    const connectionResult = await checkSupabaseConnection()

    // Additional test: Try to query a simple table
    let queryTest = { success: false, error: null, data: null }

    try {
      const { supabase } = await import("./supabase")
      // Use a simpler query that doesn't use aggregate functions
      const { data, error } = await supabase.from("forum_categories").select("id, name").limit(5)

      queryTest = {
        success: !error,
        error: error?.message || null,
        data: data,
      }
    } catch (err) {
      queryTest.error = err instanceof Error ? err.message : "Unknown error"
    }

    return {
      name: "Supabase",
      connected: connectionResult.connected,
      details: connectionResult,
      queryTest,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      name: "Supabase",
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test Neon PostgreSQL connection and functionality
 */
export async function testNeon() {
  try {
    const connectionResult = await checkDatabaseConnection()
    const schemaResult = await checkDatabaseSchema()

    return {
      name: "Neon PostgreSQL",
      connected: connectionResult.connected,
      schemaValid: schemaResult.valid,
      connectionDetails: connectionResult,
      schemaDetails: schemaResult,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      name: "Neon PostgreSQL",
      connected: false,
      schemaValid: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test Redis connection and functionality
 */
export async function testRedis() {
  try {
    const connectionResult = await checkRedisConnection()

    // If connected, perform a more detailed health check
    let healthCheck = null
    if (connectionResult.connected) {
      healthCheck = await performRedisHealthCheck()
    }

    return {
      name: "Upstash Redis",
      connected: connectionResult.connected,
      details: connectionResult,
      health: healthCheck,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      name: "Upstash Redis",
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Test Vercel Blob functionality
 */
export async function testBlob() {
  try {
    const testId = uuidv4()
    const testContent = `Test content ${testId}`
    const testFilename = `test-${testId}.txt`

    // Test uploading a blob
    const uploadResult = await put(testFilename, testContent, {
      access: "public",
    })

    // Test listing blobs
    const listResult = await list()

    // Test deleting the blob
    await del(uploadResult.url)

    return {
      name: "Vercel Blob",
      working: true,
      uploadTest: {
        success: Boolean(uploadResult?.url),
        url: uploadResult?.url || null,
      },
      listTest: {
        success: Array.isArray(listResult.blobs),
        count: listResult.blobs.length,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    return {
      name: "Vercel Blob",
      working: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Run all integration tests
 */
export async function testAllIntegrations() {
  const results = {
    supabase: await testSupabase(),
    neon: await testNeon(),
    redis: await testRedis(),
    blob: await testBlob(),
    timestamp: new Date().toISOString(),
  }

  return results
}
