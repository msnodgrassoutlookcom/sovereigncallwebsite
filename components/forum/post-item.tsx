"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Flag } from "lucide-react"
import { ReactionDisplay } from "./reaction-display"
import { ReactionPicker } from "./reaction-picker"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

export interface PostItemProps {
  post: {
    id: string
    content: string
    created_at: string
    author: {
      id: string
      username: string
      avatar_url?: string
    }
    attachments?: {
      url: string
      filename: string
    }[]
    reactions?: {
      emoji: string
      count: number
      users: string[]
    }[]
  }
  onReply?: () => void
  showReplyButton?: boolean
}

export function PostItem({ post, onReply, showReplyButton = true }: PostItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const { user } = useAuth()

  const toggleReactionPicker = () => {
    setShowReactionPicker(!showReactionPicker)
  }

  const handleReactionSelect = async (emoji: string) => {
    // Handle reaction selection
    setShowReactionPicker(false)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "some time ago"
    }
  }

  // Function to render attachments
  const renderAttachments = () => {
    if (!post.attachments || post.attachments.length === 0) return null

    return (
      <div className="mt-4 space-y-2">
        {post.attachments.map((attachment, index) => {
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.filename)

          if (isImage) {
            return (
              <div key={index} className="overflow-hidden rounded-md border">
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative h-48 w-full">
                    <Image
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.filename}
                      fill
                      className="object-contain"
                    />
                  </div>
                </a>
              </div>
            )
          }

          return (
            <div key={index} className="flex items-center gap-2 rounded-md border p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                >
                  {attachment.filename}
                </a>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.avatar_url || "/placeholder.svg"} alt={post.author.username} />
          <AvatarFallback>{post.author.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <div className="font-semibold">{post.author.username}</div>
          <div className="text-xs text-muted-foreground">{formatDate(post.created_at)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {renderAttachments()}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-2">
        <div className="flex items-center gap-2">
          {post.reactions && post.reactions.length > 0 && (
            <ReactionDisplay reactions={post.reactions} postId={post.id} />
          )}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={toggleReactionPicker}>
              <span className="mr-1">😀</span>
              <span className="text-xs">React</span>
            </Button>
            {showReactionPicker && (
              <ReactionPicker
                onSelect={handleReactionSelect}
                onClose={() => setShowReactionPicker(false)}
                postId={post.id}
              />
            )}
          </div>
          {showReplyButton && (
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onReply} disabled={!user}>
              <MessageSquare className="mr-1 h-4 w-4" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Flag className="h-4 w-4" />
          <span className="sr-only">Report</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PostItem
