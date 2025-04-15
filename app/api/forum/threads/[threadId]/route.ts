import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"
import { cache, invalidateCache, CACHE_TIMES, invalidateCachePattern } from "@/lib/cache"
import { getRedisClient } from "@/lib/redis"

export async function GET(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const threadId = params.threadId
    const cacheKey = `forum:thread:${threadId}`

    // Increment view count using Redis
    const redis = getRedisClient()
    if (redis) {
      // Atomic increment
      await redis.incr(`forum:thread:${threadId}:views`)
      // Set expiration if it's a new key
      await redis.expire(`forum:thread:${threadId}:views`, CACHE_TIMES.WEEK)
    } else {
      // Fallback to database increment if Redis is unavailable
      await supabase.rpc("increment_thread_view", { thread_id: threadId })
    }

    // Get thread with posts using cache
    return await cache(
      cacheKey,
      async () => {
        // Get thread details
        const { data: thread, error: threadError } = await supabase
          .from("forum_threads")
          .select("*")
          .eq("id", threadId)
          .single()

        if (threadError) {
          console.error("Error fetching forum thread:", threadError)
          return NextResponse.json({ error: "Failed to fetch forum thread" }, { status: 404 })
        }

        // Get thread author
        const { data: threadAuthor } = await supabase.from("users").select("username").eq("id", thread.user_id).single()

        // Get posts for this thread
        const { data: posts, error: postsError } = await supabase
          .from("forum_posts")
          .select("*")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true })

        if (postsError) {
          console.error("Error fetching forum posts:", postsError)
          return NextResponse.json({ error: "Failed to fetch forum posts" }, { status: 500 })
        }

        // Get author information for each post
        const postsWithAuthors = await Promise.all(
          posts.map(async (post) => {
            const { data: userData } = await supabase
              .from("users")
              .select("username, profile_picture_url")
              .eq("id", post.user_id)
              .single()

            // Get reactions for this post
            const { data: reactions } = await supabase.from("forum_reactions").select("*").eq("post_id", post.id)

            // Group reactions by type and count them
            const groupedReactions = reactions?.reduce(
              (acc, reaction) => {
                if (!acc[reaction.reaction_type]) {
                  acc[reaction.reaction_type] = {
                    count: 0,
                    users: [],
                  }
                }
                acc[reaction.reaction_type].count++
                acc[reaction.reaction_type].users.push(reaction.user_id)
                return acc
              },
              {} as Record<string, { count: number; users: string[] }>,
            )

            // Format reactions for the UI
            const formattedReactions = Object.entries(groupedReactions || {}).map(([type, data]) => ({
              emoji: type,
              count: data.count,
              reacted: false, // Will be updated on the client side
            }))

            return {
              ...post,
              author: userData?.username || "Unknown User",
              author_avatar: userData?.profile_picture_url || null,
              reactions: formattedReactions,
            }
          }),
        )

        // Get view count from Redis if available
        let viewCount = thread.views || 0
        if (redis) {
          const redisViews = await redis.get<number>(`forum:thread:${threadId}:views`)
          if (redisViews !== null) {
            viewCount = redisViews
          }
        }

        return NextResponse.json({
          thread: {
            ...thread,
            views: viewCount,
            author: threadAuthor?.username || "Unknown User",
          },
          posts: postsWithAuthors,
        })
      },
      CACHE_TIMES.SHORT, // Short cache time for forum threads as they're frequently updated
    )
  } catch (error) {
    console.error("Unexpected error fetching forum thread:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Update the PUT and DELETE methods to invalidate cache
export async function PUT(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const threadId = params.threadId
    const body = await request.json()
    const { title, is_pinned, is_locked } = body

    // Check if thread exists and user is authorized
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("id", threadId)
      .single()

    if (threadError) {
      console.error("Error fetching forum thread:", threadError)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    // Only allow the thread creator or an admin to update the thread
    const isAdmin = user.role === "admin"
    if (thread.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this thread" }, { status: 403 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (is_pinned !== undefined) updateData.is_pinned = is_pinned
    if (is_locked !== undefined) updateData.is_locked = is_locked
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("forum_threads").update(updateData).eq("id", threadId).select()

    if (error) {
      console.error("Error updating forum thread:", error)
      return NextResponse.json({ error: "Failed to update forum thread" }, { status: 500 })
    }

    // Invalidate cache for this thread
    await invalidateCache(`forum:thread:${threadId}`)

    // Also invalidate any category cache that might include this thread
    await invalidateCachePattern(`forum:category:*`)

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error updating forum thread:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { threadId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const threadId = params.threadId

    // Check if thread exists and user is authorized
    const { data: thread, error: threadError } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("id", threadId)
      .single()

    if (threadError) {
      console.error("Error fetching forum thread:", threadError)
      return NextResponse.json({ error: "Thread not found" }, { status: 404 })
    }

    // Only allow the thread creator or an admin to delete the thread
    const isAdmin = user.role === "admin"
    if (thread.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this thread" }, { status: 403 })
    }

    // Delete the thread (cascade will delete posts)
    const { error } = await supabase.from("forum_threads").delete().eq("id", threadId)

    if (error) {
      console.error("Error deleting forum thread:", error)
      return NextResponse.json({ error: "Failed to delete forum thread" }, { status: 500 })
    }

    // Invalidate cache for this thread
    await invalidateCache(`forum:thread:${threadId}`)

    // Also invalidate any category cache that might include this thread
    await invalidateCachePattern(`forum:category:*`)

    // Clean up view counter
    const redis = getRedisClient()
    if (redis) {
      await redis.del(`forum:thread:${threadId}:views`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error deleting forum thread:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
