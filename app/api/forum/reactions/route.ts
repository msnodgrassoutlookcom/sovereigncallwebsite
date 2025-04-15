import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { getUserFromRequest } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, reaction_type } = body

    if (!post_id || !reaction_type) {
      return NextResponse.json({ error: "Post ID and reaction type are required" }, { status: 400 })
    }

    // Check if user already reacted with this reaction type
    const { data: existingReaction } = await supabase
      .from("forum_reactions")
      .select("*")
      .eq("post_id", post_id)
      .eq("user_id", user.id)
      .eq("reaction_type", reaction_type)
      .single()

    if (existingReaction) {
      // User already reacted with this type, so remove the reaction
      const { error } = await supabase.from("forum_reactions").delete().eq("id", existingReaction.id)

      if (error) {
        console.error("Error removing forum reaction:", error)
        return NextResponse.json({ error: "Failed to remove forum reaction" }, { status: 500 })
      }

      return NextResponse.json({ removed: true, reaction_type })
    } else {
      // Add new reaction
      const { data, error } = await supabase
        .from("forum_reactions")
        .insert([
          {
            id: uuidv4(),
            post_id,
            user_id: user.id,
            reaction_type,
          },
        ])
        .select()

      if (error) {
        console.error("Error creating forum reaction:", error)
        return NextResponse.json({ error: "Failed to create forum reaction" }, { status: 500 })
      }

      return NextResponse.json({ added: true, reaction: data[0] })
    }
  } catch (error) {
    console.error("Unexpected error managing forum reaction:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("post_id")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase.from("forum_reactions").select("*").eq("post_id", postId)

    if (error) {
      console.error("Error fetching forum reactions:", error)
      return NextResponse.json({ error: "Failed to fetch forum reactions" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error fetching forum reactions:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
