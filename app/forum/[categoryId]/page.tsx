import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NewThreadButton } from "@/components/forum/new-thread-button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { ForumCategory, ForumThread } from "@/lib/types"

interface CategoryPageProps {
  params: {
    categoryId: string
  }
}

async function getCategory(categoryId: string): Promise<ForumCategory | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("forum_categories").select("*").eq("id", categoryId).single()

    if (error) {
      console.error("Error fetching category:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

async function getThreads(categoryId: string): Promise<ForumThread[]> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("forum_threads")
      .select(`
        *,
        post_count:forum_posts(count)
      `)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching threads:", error)
      return []
    }

    // Fetch usernames separately
    const threadsWithAuthors = await Promise.all(
      data.map(async (thread) => {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("username, display_name")
          .eq("id", thread.user_id)
          .single()

        if (userError) {
          console.error("Error fetching user data:", userError)
          return { ...thread, author: "Unknown User" }
        }

        return { ...thread, author: userData?.username || "Unknown User", display_name: userData?.display_name }
      }),
    )

    return threadsWithAuthors || []
  } catch (error) {
    console.error("Error fetching threads:", error)
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = params
  const category = await getCategory(categoryId)
  const threads = await getThreads(categoryId)

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
