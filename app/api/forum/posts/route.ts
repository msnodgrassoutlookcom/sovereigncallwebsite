import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { getUserFromRequest } from "@/lib/auth"
import { invalidateCache, invalidateCachePattern } from "@/lib/cache"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const threadId = url.searchParams.get("threadId")
    const cursor = url.searchParams.get("cursor") // Last post ID for cursor pagination
    const limit = Number.parseInt(url.searchParams.get("limit") || "20", 10)

    if (!threadId) {
      return NextResponse.json({ error: "Thread ID is required" }, { status: 400 })
    }

    // Cursor-based pagination is more efficient for large datasets
    let query = supabase
      .from("forum_posts")
      .select(`
        id,
        content,
        created_at,
        user_id,
        is_edited,
        parent_id,
        users:user_id (username, profile_picture_url)
      `)
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (cursor) {
      query = query.gt("id", cursor)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("Error fetching posts:", error)
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }

    // Format the posts for the client
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      is_edited: post.is_edited,
      parent_id: post.parent_id,
      author: post.users?.username || "Unknown User",
      author_avatar: post.users?.profile_picture_url || null,
    }))

    // Get the next cursor
    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null

    // Add cache headers
    const response = NextResponse.json({
      posts: formattedPosts,
      pagination: {
        nextCursor,
        hasMore: nextCursor !== null,
      },
    })

    // Add cache control headers - short TTL with stale-while-revalidate
    response.headers.set("Cache-Control", "public, max-age=30, stale-while-revalidate=60")

    return response
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    // Handle both camelCase and snake_case parameters
    const threadId = body.thread_id || body.threadId
    const content = body.content
    const parentId = body.parent_id || body.parentId
    const attachments = body.attachments || []

    if (!threadId || !content) {
      return NextResponse.json({ error: "Thread ID and content are required" }, { status: 400 })
    }

    console.log("Creating post with:", { threadId, content, userId: user.id })

    // Check if thread exists and is not locked
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("is_locked")
      .eq("id", threadId)
      .single()

    if (threadError) {
      console.error("Error fetching forum thread:", threadError)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    if (thread.is_locked) {
      return NextResponse.json({ error: "Thread is locked" }, { status: 403 })
    }

    // Create the post
    const { data, error } = await supabase
      .from("forum_posts")
      .insert([
        {
          id: uuidv4(),
          thread_id: threadId,
          user_id: user.id,
          content,
          is_edited: false,
          parent_id: parentId || null,
        },
      ])
      .select()

    if (error) {
      console.error("Error creating forum post:", error)
      return NextResponse.json(
        {
          error: "Failed to create forum post",
          details: {
            message: error.message,
            code: error.code,
          },
        },
        { status: 500 },
      )
    }

    // Update thread's updated_at timestamp
    await supabase.from("forum_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId)

    // Get author information
    const { data: userData } = await supabase
      .from("users")
      .select("username, profile_picture_url")
      .eq("id", user.id)
      .single()

    // Invalidate cache for this thread
    if (typeof invalidateCache === "function") {
      await invalidateCache(`forum:thread:${threadId}`)
      await invalidateCachePattern(`forum:category:*`)
    }

    return NextResponse.json({
      ...data[0],
      author: userData?.username || "Unknown User",
      author_avatar: userData?.profile_picture_url || null,
      reactions: [],
    })
  } catch (error) {
    console.error("Unexpected error creating forum post:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
