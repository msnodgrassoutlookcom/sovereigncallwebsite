import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NewThreadButton } from "@/components/forum/new-thread-button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { cache, CACHE_TIMES } from "@/lib/cache"
import type { ForumCategory, ForumThread } from "@/lib/types"

interface CategoryPageProps {
  params: {
    categoryId: string
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

// Optimized thread fetcher with batched queries
async function getThreads(categoryId: string): Promise<ForumThread[]> {
  return cache(
    `forum:category:${categoryId}:threads`,
    async () => {
      const supabase = createServerSupabaseClient()
      const startTime = performance.now()

      // Get threads with a single query
      const { data: threads, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching threads:", error)
        return []
      }

      if (!threads || threads.length === 0) {
        return []
      }

      // Extract all user IDs for a single batch query
      const userIds = [...new Set(threads.map((thread) => thread.user_id))]

      // Batch query for all users
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, username, display_name")
        .in("id", userIds)

      if (userError) {
        console.error("Error fetching users:", userError)
      }

      // Create a map of user data for quick lookup
      const userMap = (users || []).reduce(
        (map, user) => {
          map[user.id] = user
          return map
        },
        {} as Record<string, any>,
      )

      // Batch query for post counts using a single query with GROUP BY
      const { data: postCounts, error: countError } = await supabase.rpc("get_thread_post_counts", {
        thread_ids: threads.map((t) => t.id),
      })

      if (countError) {
        console.error("Error counting posts:", countError)
      }

      // Create a map of post counts for quick lookup
      const postCountMap = (postCounts || []).reduce(
        (map, item) => {
          map[item.thread_id] = item.count
          return map
        },
        {} as Record<string, number>,
      )

      // Combine all data
      const threadsWithDetails = threads.map((thread) => {
        const user = userMap[thread.user_id] || {}
        return {
          ...thread,
          author: user.username || "Unknown User",
          display_name: user.display_name,
          post_count: [{ count: postCountMap[thread.id] || 0 }],
        }
      })

      const endTime = performance.now()
      console.log(`Thread data fetched in ${(endTime - startTime).toFixed(2)}ms for ${threads.length} threads`)

      return threadsWithDetails
    },
    CACHE_TIMES.SHORT, // Threads change more frequently
    { tags: [`category:${categoryId}:threads`, `category:${categoryId}`] },
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = params

  // Parallel data fetching
  const [category, threads] = await Promise.all([getCategory(categoryId), getThreads(categoryId)])

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Category Not Found</h2>
        <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/forum">Back to Forum</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/forum" className="hover:underline">
              Forum
            </Link>
            <ChevronRight className="mr-2 h-4 w-4" />
            <span>{category.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        <NewThreadButton categoryId={categoryId} />
      </div>

      {threads.length > 0 ? (
        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} categoryId={categoryId} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">No Threads Yet</h2>
          <p className="text-muted-foreground mb-6">Be the first to start a discussion in this category!</p>
          <NewThreadButton categoryId={categoryId} />
        </div>
      )}
    </div>
  )
}

function ThreadCard({ thread, categoryId }: { thread: ForumThread; categoryId: string }) {
  return (
    <Link href={`/forum/${categoryId}/${thread.id}`}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{thread.title}</CardTitle>
          <CardDescription>Posted by {thread.display_name || thread.author || "Unknown User"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-muted-foreground">{thread.content}</p>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>{thread.post_count?.[0]?.count || 0} replies</span>
            <span>{thread.view_count || 0} views</span>
            <span>
              {new Date(thread.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
