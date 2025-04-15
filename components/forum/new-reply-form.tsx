"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { AttachmentUploader } from "./attachment-uploader"
import { AttachmentPreview } from "./attachment-preview"

interface Attachment {
  url: string
  type: string
}

interface NewReplyFormProps {
  threadId: string
  onPostCreated: (post: any) => void
}

export function NewReplyForm({ threadId, onPostCreated }: NewReplyFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && attachments.length === 0) {
      toast({
        title: "Error",
        description: "Please enter a message or add an attachment.",
        variant: "destructive",
      })
      return
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      console.log("Submitting post:", { threadId, content, attachments })

      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thread_id: threadId, // Use snake_case to match API expectations
          content,
          attachments,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Server error:", errorData)
        throw new Error(errorData.error || "Failed to create post")
      }

      const newPost = await response.json()
      console.log("Post created successfully:", newPost)

      toast({
        title: "Success",
        description: "Your reply has been posted.",
      })

      setContent("")
      setAttachments([])
      onPostCreated(newPost)
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post your reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAttachmentAdded = (attachment: Attachment) => {
    setAttachments((prev) => [...prev, attachment])
  }

  const handleRemoveAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((a) => a.url !== url))
  }

  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4">
      <h3 className="text-lg font-medium">Post a Reply</h3>

      <Textarea
        placeholder="Write your reply here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[120px]"
        disabled={isSubmitting}
      />

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <AttachmentPreview key={attachment.url} attachment={attachment} onRemove={handleRemoveAttachment} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <AttachmentUploader onAttachmentAdded={handleAttachmentAdded} />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Reply"}
        </Button>
      </div>
    </form>
  )
}

export default NewReplyForm
