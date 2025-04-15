import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    // Check if tables exist
    const { data: existingTables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (tablesError) {
      return NextResponse.json({ error: "Failed to check tables", details: tablesError }, { status: 500 })
    }

    const tableNames = existingTables.map((t) => t.table_name)
    const results = { created: [], existing: [], errors: [] }

    // Create forum_categories if it doesn't exist
    if (!tableNames.includes("forum_categories")) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE forum_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        results.errors.push({ table: "forum_categories", error: error.message })
      } else {
        results.created.push("forum_categories")
      }
    } else {
      results.existing.push("forum_categories")
    }

    // Create forum_threads if it doesn't exist
    if (!tableNames.includes("forum_threads")) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE forum_threads (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            category_id TEXT NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            is_pinned BOOLEAN DEFAULT FALSE,
            is_locked BOOLEAN DEFAULT FALSE,
            view_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        results.errors.push({ table: "forum_threads", error: error.message })
      } else {
        results.created.push("forum_threads")
      }
    } else {
      results.existing.push("forum_threads")
    }

    // Create forum_posts if it doesn't exist
    if (!tableNames.includes("forum_posts")) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE forum_posts (
            id TEXT PRIMARY KEY,
            thread_id TEXT NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            content TEXT NOT NULL,
            is_edited BOOLEAN DEFAULT FALSE,
            parent_id TEXT REFERENCES forum_posts(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        results.errors.push({ table: "forum_posts", error: error.message })
      } else {
        results.created.push("forum_posts")
      }
    } else {
      results.existing.push("forum_posts")
    }

    // Create forum_reactions if it doesn't exist
    if (!tableNames.includes("forum_reactions")) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE forum_reactions (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            reaction_type TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        results.errors.push({ table: "forum_reactions", error: error.message })
      } else {
        results.created.push("forum_reactions")
      }
    } else {
      results.existing.push("forum_reactions")
    }

    // Create forum_attachments if it doesn't exist
    if (!tableNames.includes("forum_attachments")) {
      const { error } = await supabase.rpc("execute_sql", {
        sql: `
          CREATE TABLE forum_attachments (
            id TEXT PRIMARY KEY,
            post_id TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
            file_url TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      })

      if (error) {
        results.errors.push({ table: "forum_attachments", error: error.message })
      } else {
        results.created.push("forum_attachments")
      }
    } else {
      results.existing.push("forum_attachments")
    }

    // Seed some initial categories if none exist
    if (results.created.includes("forum_categories") || results.existing.includes("forum_categories")) {
      const { count, error: countError } = await supabase
        .from("forum_categories")
        .select("*", { count: "exact", head: true })

      if (!countError && count === 0) {
        const { error: seedError } = await supabase.from("forum_categories").insert([
          {
            id: "lore",
            name: "Lore & Story",
            description: "Discuss the rich lore and story of Sovereign's Call",
            icon: "BookOpen",
          },
          {
            id: "gameplay",
            name: "Gameplay & Mechanics",
            description: "Talk about gameplay mechanics and strategies",
            icon: "Gamepad2",
          },
          {
            id: "suggestions",
            name: "Suggestions & Ideas",
            description: "Share your ideas for improving the game",
            icon: "Lightbulb",
          },
          {
            id: "questions",
            name: "General Questions",
            description: "Ask general questions about the game",
            icon: "HelpCircle",
          },
        ])

        if (seedError) {
          results.errors.push({ table: "forum_categories_seed", error: seedError.message })
        } else {
          results.created.push("initial_categories")
        }
      }
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      results,
    })
  } catch (error) {
    console.error("Error setting up forum tables:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
