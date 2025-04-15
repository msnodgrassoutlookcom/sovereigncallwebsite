import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Default categories to seed the database
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

export async function GET() {
  try {
    // Check if any categories exist
    const { data: existingCategories, error: checkError } = await supabase.from("forum_categories").select("id")

    if (checkError) {
      console.error("Error checking for existing categories:", checkError)
      return NextResponse.json({ error: "Failed to check existing categories" }, { status: 500 })
    }

    // If categories already exist, return them
    if (existingCategories && existingCategories.length > 0) {
      return NextResponse.json({
        message: `${existingCategories.length} categories already exist`,
        categories: existingCategories,
      })
    }

    // Insert default categories
    const { data, error: insertError } = await supabase.from("forum_categories").insert(defaultCategories).select()

    if (insertError) {
      console.error("Error seeding default categories:", insertError)
      return NextResponse.json({ error: "Failed to seed default categories" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Successfully seeded default categories",
      categories: defaultCategories,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
