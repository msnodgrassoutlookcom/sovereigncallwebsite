import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { OptimizedPostList } from "@/components/forum/optimized-post-list"
import { Skeleton } from "@/components/ui/skeleton"

import { NewReplyForm } from "@/components/forum/new-reply-form"
import { getUserFromSession } from "@/lib/supabase-server"

// Add other imports as needed

export default async function ThreadPage({ params }: { params: { categoryId: string; threadId: string } }) {
  const { threadId, categoryId } = params

  // Fetch thread data
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("*, users:user_id (username, profile_picture_url)")
    .eq("id", threadId)
    .single()

  // Fetch initial posts (first page only)
  const { data: initialPosts } = await supabase
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
    .limit(20)

  // Format posts for the client
  const formattedPosts =
    initialPosts?.map((post) => ({
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      user_id: post.user_id,
      is_edited: post.is_edited,
      parent_id: post.parent_id,
      author: post.users?.username || "Unknown User",
      author_avatar: post.users?.profile_picture_url || null,
    })) || []

  const currentUser = await getUserFromSession()

  if (!thread) {
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
    <div className="container py-8">
      <div className="space-y-1">
        <div className="flex items-center text-sm text-muted-foreground">
          <Link href="/forum" className="hover:underline">
            Forum
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href={`/forum/${categoryId}`} className="hover:underline">
            Category
          </Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="truncate max-w-[200px]">{thread.title}</span>
        </div>
        <h1 className="text-3xl font-bold mb-6">{thread?.title}</h1>
      </div>

      <div className="mb-8">
        <div className="text-sm text-muted-foreground">
          Posted by {thread?.users?.username || "Unknown User"} on {new Date(thread?.created_at).toLocaleDateString()}
        </div>
      </div>

      <Suspense fallback={<PostListSkeleton />}>
        <OptimizedPostList posts={formattedPosts} threadId={threadId} />
      </Suspense>

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

function PostListSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
    </div>
  )
}
