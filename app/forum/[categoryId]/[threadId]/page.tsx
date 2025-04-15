import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PostList } from "@/components/forum/post-list"
import { NewReplyForm } from "@/components/forum/new-reply-form"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getUserFromSession } from "@/lib/supabase-server"
import { cache, CACHE_TIMES } from "@/lib/cache"
import { getServerRedisClient } from "@/lib/redis"
import type { ForumCategory, ForumThread, ForumPost } from "@/lib/types"

interface ThreadPageProps {
  params: {
    categoryId: string
    threadId: string
  }
}

// Optimized category fetcher with caching
async function getCategory(categoryId: string): Promise<ForumCategory | null> {
  return cache(
    `forum:category:${categoryId}`,
    async () => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase.from("forum_categories").select("*").eq("id", categoryId).single()

      if (error) {
        console.error("Error fetching category:", error)
        return null
      }

      return data
    },
    CACHE_TIMES.DAY, // Categories rarely change, cache for a day
    { tags: [`category:${categoryId}`, "categories"] },
  )
}

// Optimized thread fetcher with view count tracking and caching
async function getThread(threadId: string): Promise<ForumThread | null> {
  const startTime = performance.now()

  // Increment view count using Redis
  const redis = getServerRedisClient()
  if (redis) {
    // Atomic increment with periodic persistence to database
    const viewKey = `forum:thread:${threadId}:views`
    const newViewCount = await redis.incr(viewKey)

    // Every 10 views, or if this is view #1, persist to database
    if (newViewCount === 1 || newViewCount % 10 === 0) {
      // Set expiration if this is a new key
      if (newViewCount === 1) {
        await redis.expire(viewKey, CACHE_TIMES.WEEK)
      }

      // Persist to database in background
      updateThreadViewsInDatabase(threadId, newViewCount).catch(console.error)
    }
  }

  // Fetch thread data with caching
  const thread = await cache(
    `forum:thread:${threadId}`,
    async () => {
      const supabase = createServerSupabaseClient()

      // Get view count from Redis if available
      let viewCount = 0
      if (redis) {
        viewCount = (await redis.get<number>(`forum:thread:${threadId}:views`)) || 0
      }

      const { data, error } = await supabase
        .from("forum_threads")
        .select(`
          *,
          user:user_id (id, username, display_name)
        `)
        .eq("id", threadId)
        .single()

      if (error) {
        console.error("Error fetching thread:", error)
        return null
      }

      // Use Redis view count if available, otherwise use database value
      if (viewCount > 0) {
        data.view_count = viewCount
      }

      return data
    },
    CACHE_TIMES.SHORT, // Thread data might change frequently
    { tags: [`thread:${threadId}`, `category:${threadId.split("-")[0]}`] },
  )

  const endTime = performance.now()
  console.log(`Thread data fetched in ${(endTime - startTime).toFixed(2)}ms`)

  return thread
}

// Update thread view count in database periodically
async function updateThreadViewsInDatabase(threadId: string, viewCount: number) {
  try {
    const supabase = createServerSupabaseClient()
    await supabase.from("forum_threads").update({ view_count: viewCount }).eq("id", threadId)
  } catch (error) {
    console.error(`Failed to update thread view count in database:`, error)
  }
}

// Optimized post fetcher with caching and batched user data
async function getPosts(threadId: string): Promise<ForumPost[]> {
  const startTime = performance.now()

  const posts = await cache(
    `forum:thread:${threadId}:posts`,
    async () => {
      const supabase = createServerSupabaseClient()

      // Get posts with minimal user data and reactions in a single query
      const { data: posts, error } = await supabase
        .from("forum_posts")
        .select(`
          *,
          user:user_id (id, username, display_name, avatar_url),
          reactions:forum_reactions (*)
        `)
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Error fetching posts:", error)
        return []
      }

      return posts || []
    },
    CACHE_TIMES.SHORT, // Posts might change frequently
    { tags: [`thread:${threadId}:posts`, `thread:${threadId}`] },
  )

  const endTime = performance.now()
  console.log(`Posts fetched in ${(endTime - startTime).toFixed(2)}ms for ${posts.length} posts`)

  return posts
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { categoryId, threadId } = params
  const pageLoadStart = performance.now()

  // Parallel data fetching with Promise.all for better performance
  const [category, thread, posts, currentUser] = await Promise.all([
    getCategory(categoryId),
    getThread(threadId),
    getPosts(threadId),
    getUserFromSession(), // This should be cached elsewhere
  ])

  const pageLoadEnd = performance.now()
  console.log(`Thread page data loaded in ${(pageLoadEnd - pageLoadStart).toFixed(2)}ms`)

  if (!category || !thread) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Thread Not Found</h2>
        <p className="text-muted-foreground mb-6">The thread you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/forum" className="hover:underline">
            Forum
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/forum/${categoryId}`} className="hover:underline">
            {category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="truncate max-w-[200px]">{thread.title}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{thread.title}</h1>
        <p className="text-muted-foreground">
          Started by {thread.user?.display_name || thread.user?.username || "Unknown User"} on{" "}
          {new Date(thread.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>

      <PostList posts={posts} currentUser={currentUser} />

      {currentUser ? (
        <NewReplyForm threadId={threadId} userId={currentUser.id} />
      ) : (
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="mb-2">You need to be logged in to reply to this thread.</p>
          <Button asChild>
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
