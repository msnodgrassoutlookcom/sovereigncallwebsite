import { createServerSupabaseClient } from "./supabase"

export async function checkDatabaseConnection() {
  try {
    const supabase = createServerSupabaseClient()

    // Try a simple query to check connection
    const { data, error } = await supabase.from("users").select("id").limit(1)

    if (error) {
      console.error("Database connection error:", error)
      return {
        connected: false,
        error: error.message,
      }
    }

    return {
      connected: true,
      error: null,
    }
  } catch (error) {
    console.error("Database connection check failed:", error)
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function checkDatabaseSchema() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if users table exists and has required columns
    const { data: usersData, error: usersError } = await supabase.from("users").select("id, username, email").limit(1)

    if (usersError) {
      console.error("Users table check failed:", usersError)
      return {
        valid: false,
        error: `Users table issue: ${usersError.message}`,
      }
    }

    // Check if characters table exists and has required columns
    const { data: charactersData, error: charactersError } = await supabase
      .from("characters")
      .select("id, user_id, name")
      .limit(1)

    if (charactersError) {
      console.error("Characters table check failed:", charactersError)
      return {
        valid: false,
        error: `Characters table issue: ${charactersError.message}`,
      }
    }

    return {
      valid: true,
      error: null,
    }
  } catch (error) {
    console.error("Database schema check failed:", error)
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
