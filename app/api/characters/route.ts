import { NextResponse } from "next/server"
import { saveCharacter, getCharacterCount } from "@/lib/db"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  try {
    const { userId, character } = await request.json()

    // Validate input
    if (!userId || !character || !character.name) {
      return NextResponse.json({ error: "User ID and character name are required" }, { status: 400 })
    }

    // Check if user already has 2 characters
    const characterCount = await getCharacterCount(userId)
    if (characterCount >= 2 && !character.id) {
      return NextResponse.json({ error: "Maximum of 2 characters allowed" }, { status: 400 })
    }

    // Save character
    const savedCharacter = await saveCharacter(userId, character)

    if (!savedCharacter) {
      return NextResponse.json({ error: "Failed to save character" }, { status: 500 })
    }

    // We don't need to send an email for character creation in the preview environment
    // This avoids the DNS lookup error in Edge runtime

    return NextResponse.json({ character: savedCharacter }, { status: 201 })
  } catch (error) {
    console.error("Save character error:", error)
    return NextResponse.json({ error: "Failed to save character" }, { status: 500 })
  }
}
