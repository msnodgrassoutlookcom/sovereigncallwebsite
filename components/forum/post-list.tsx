"use client"

import { useState, useEffect } from "react"
import { PostItem } from "./post-item"
import { NewReplyForm } from "./new-reply-form"
import { useAuth } from "@/context/auth-context"

export interface Post {
  id: string
  thread_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  username: string
  avatar_url?: string
  attachments?: { url: string; type: string }[]
}

interface PostListProps {
  threadId: string
  initialPosts?: Post[]
}

export function PostList({ threadId, initialPosts = [] }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(!initialPosts.length)
  const { user } = useAuth()

  const fetchPosts = async () => {
    if (!threadId) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/forum/posts?threadId=${threadId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!initialPosts.length) {
      fetchPosts()
    }
  }, [threadId, initialPosts.length])

  const handleNewPost = (newPost: Post) => {
    setPosts((prevPosts) => [...prevPosts, newPost])
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map((post) => <PostItem key={post.id} post={post} />)
      ) : (
        <div className="text-center p-4 border rounded-lg">
          <p className="text-muted-foreground">No posts yet. Be the first to reply!</p>
        </div>
      )}

      {user && <NewReplyForm threadId={threadId} onPostCreated={handleNewPost} />}
    </div>
  )
}

export default PostList
