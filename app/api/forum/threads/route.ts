import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { v4 as uuidv4 } from "uuid"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("forum_threads").select("*")

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching forum threads:", error)
      return NextResponse.json({ error: "Failed to fetch forum threads" }, { status: 500 })
    }

    // Get author information for each thread
    const threadsWithAuthors = await Promise.all(
      data.map(async (thread) => {
        const { data: userData } = await supabase.from("users").select("username").eq("id", thread.user_id).single()

        // Count posts in thread
        const { count } = await supabase
          .from("forum_posts")
          .select("*", { count: "exact", head: true })
          .eq("thread_id", thread.id)

        // Get last post timestamp
        const { data: lastPost } = await supabase
          .from("forum_posts")
          .select("created_at")
          .eq("thread_id", thread.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        return {
          ...thread,
          author: userData?.username || "Unknown User",
          post_count: count || 0,
          last_post_at: lastPost?.created_at || thread.created_at,
        }
      }),
    )

    return NextResponse.json(threadsWithAuthors)
  } catch (error) {
    console.error("Unexpected error fetching forum threads:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/forum/threads - Starting")

    const user = await getUserFromRequest(request)
    if (!user) {
      console.log("POST /api/forum/threads - Authentication required")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("POST /api/forum/threads - User authenticated:", user.id)

    const body = await request.json()
    console.log("POST /api/forum/threads - Request body:", JSON.stringify(body))

    const { title, category_id, content } = body

    if (!title || !category_id || !content) {
      console.log("POST /api/forum/threads - Missing required fields")
      return NextResponse.json(
        {
          error: "Missing required fields",
          received: { title: !!title, category_id: !!category_id, content: !!content },
        },
        { status: 400 },
      )
    }

    // Generate a thread ID
    const threadId = uuidv4()
    console.log("POST /api/forum/threads - Generated thread ID:", threadId)

    const supabase = createServerSupabaseClient()

    // Create the thread
    console.log("POST /api/forum/threads - Creating thread")
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .insert([
        {
          id: threadId,
          title,
          category_id,
          user_id: user.id,
          is_pinned: false,
          is_locked: false,
          view_count: 0,
        },
      ])
      .select()

    if (threadError) {
      console.error("Error creating forum thread:", threadError)
      return NextResponse.json(
        {
          error: "Failed to create forum thread",
          details: {
            message: threadError.message,
            code: threadError.code,
          },
        },
        { status: 500 },
      )
    }

    console.log("POST /api/forum/threads - Thread created:", thread)

    // Create the initial post
    console.log("POST /api/forum/threads - Creating initial post")
    const postId = uuidv4()
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .insert([
        {
          id: postId,
          thread_id: threadId,
          user_id: user.id,
          content,
          is_edited: false,
          parent_id: null,
        },
      ])
      .select()

    if (postError) {
      console.error("Error creating initial forum post:", postError)
      // Try to clean up the thread if post creation fails
      await supabase.from("forum_threads").delete().eq("id", threadId)
      return NextResponse.json({ error: "Failed to create initial forum post", details: postError }, { status: 500 })
    }

    console.log("POST /api/forum/threads - Initial post created:", post)
    console.log("POST /api/forum/threads - Complete")

    return NextResponse.json({ thread: thread[0], post: post[0] })
  } catch (error) {
    console.error("Unexpected error creating forum thread:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
