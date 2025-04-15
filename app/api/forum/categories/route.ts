import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Default categories to seed the database if none exist
const defaultCategories = [
  {
    id: "announcements",
    name: "Announcements",
    description: "Official announcements about Sovereign's Call",
    icon: "Megaphone",
  },
  {
    id: "gameplay",
    name: "Gameplay",
    description: "Discussions about gameplay mechanics and strategies",
    icon: "Gamepad2",
  },
  {
    id: "lore",
    name: "Lore & Story",
    description: "Explore the rich lore and story of Sovereign's Call",
    icon: "BookOpen",
  },
  {
    id: "characters",
    name: "Characters",
    description: "Share and discuss character builds and stories",
    icon: "Users",
  },
  {
    id: "feedback",
    name: "Feedback & Suggestions",
    description: "Share your ideas and feedback for the game",
    icon: "MessageSquare",
  },
]

// Function to seed default categories if none exist
async function seedDefaultCategories() {
  try {
    // Check if any categories exist
    const { data: existingCategories, error: checkError } = await supabase
      .from("forum_categories")
      .select("id")
      .limit(1)

    if (checkError) {
      console.error("Error checking for existing categories:", checkError)
      return false
    }

    // If categories already exist, don't seed
    if (existingCategories && existingCategories.length > 0) {
      return true
    }

    console.log("No forum categories found. Seeding default categories...")

    // Insert default categories
    const { error: insertError } = await supabase.from("forum_categories").insert(defaultCategories)

    if (insertError) {
      console.error("Error seeding default categories:", insertError)
      return false
    }

    console.log("Successfully seeded default forum categories")
    return true
  } catch (error) {
    console.error("Unexpected error seeding categories:", error)
    return false
  }
}

export async function GET() {
  try {
    // Check if supabase client is initialized
    if (!supabase) {
      console.error("Supabase client is not initialized")
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }

    // Add logging to track the request
    console.log("Fetching forum categories from database...")

    // Try to seed default categories if none exist
    await seedDefaultCategories()

    const { data, error } = await supabase.from("forum_categories").select("*").order("name")

    if (error) {
      console.error("Error fetching forum categories:", error)
      return NextResponse.json({ error: "Failed to fetch forum categories" }, { status: 500 })
    }

    // If no data is returned but also no error, return an empty array
    if (!data || data.length === 0) {
      console.log("No forum categories found in database")
      return NextResponse.json([])
    }

    console.log(`Successfully fetched ${data.length} forum categories`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error fetching forum categories:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, icon } = body

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    const id = body.id || name.toLowerCase().replace(/\s+/g, "-")

    const { data, error } = await supabase
      .from("forum_categories")
      .insert([
        {
          id,
          name,
          description,
          icon,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating forum category:", error)
      return NextResponse.json({ error: "Failed to create forum category" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error creating forum category:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
