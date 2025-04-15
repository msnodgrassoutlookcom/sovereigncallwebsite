import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Replace the entire function with a more robust implementation
export async function GET() {
  try {
    console.log("DB Check API called")
    const supabase = createServerSupabaseClient()

    // Test database connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabase.from("users").select("id").limit(1)

    if (connectionError) {
      console.error("Database connection error:", connectionError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection error: " + connectionError.message,
          details: connectionError,
        },
        { status: 500 },
      )
    }

    // Check if tables exist by trying to query them
    const tablesInfo = {
      users: { exists: false, error: null },
      characters: { exists: false, error: null },
    }

    // Check users table
    try {
      const { data: usersData, error: usersError } = await supabase.from("users").select("id").limit(1)

      if (usersError) {
        tablesInfo.users.error = usersError.message
      } else {
        tablesInfo.users.exists = true
      }
    } catch (error) {
      tablesInfo.users.error = error instanceof Error ? error.message : String(error)
    }

    // Check characters table
    try {
      const { data: charactersData, error: charactersError } = await supabase.from("characters").select("id").limit(1)

      if (charactersError) {
        tablesInfo.characters.error = charactersError.message
      } else {
        tablesInfo.characters.exists = true
      }
    } catch (error) {
      tablesInfo.characters.error = error instanceof Error ? error.message : String(error)
    }

    // Count users if possible
    let userCount = null
    try {
      const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })
      if (!error) {
        userCount = count
      }
    } catch (error) {
      console.error("Error counting users:", error)
    }

    return NextResponse.json({
      success: true,
      connection: "OK",
      tables: tablesInfo,
      userCount,
    })
  } catch (error) {
    console.error("DB check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check database: " + (error instanceof Error ? error.message : String(error)),
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
