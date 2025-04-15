"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ReactionDisplay } from "@/components/forum/reaction-display"
import { ReactionPicker } from "@/components/forum/reaction-picker"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { ForumPost, User } from "@/lib/types"

interface PostListProps {
  posts: ForumPost[]
  currentUser: User | null
}

export function PostList({ posts, currentUser }: PostListProps) {
  // Track which posts have their images loaded
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => ({ ...prev, [postId]: true }))
  }

  if (!posts || posts.length === 0) {
    return <div className="text-center py-8">No posts in this thread yet.</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} id={`post-${post.id}`} className="relative">
          <CardHeader className="flex flex-row items-start gap-4 pb-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={post.user?.avatar_url || "/placeholder.svg?height=40&width=40&query=avatar"}
                alt={post.user?.username || "User"}
                loading="lazy"
                width={40}
                height={40}
              />
              <AvatarFallback>{(post.user?.username || "U")[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">
                {post.user?.display_name || post.user?.username || "Unknown User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                {post.is_edited && <span className="ml-2 text-xs">(edited)</span>}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {post.content.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}

              {/* Optimize image loading */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {post.attachments.map((attachment, i) => (
                    <div key={i} className="relative aspect-video overflow-hidden rounded-md">
                      {!loadedImages[`${post.id}-${i}`] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">Loading...</div>
                      )}
                      <Image
                        src={attachment.url || "/placeholder.svg"}
                        alt={attachment.filename || "Attachment"}
                        className={`object-cover transition-opacity duration-300 ${loadedImages[`${post.id}-${i}`] ? "opacity-100" : "opacity-0"}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        onLoad={() => handleImageLoad(`${post.id}-${i}`)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <ReactionDisplay reactions={post.reactions || []} />
            {currentUser && <ReactionPicker postId={post.id} userId={currentUser.id} />}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
