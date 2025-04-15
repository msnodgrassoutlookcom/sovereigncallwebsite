"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { put } from "@vercel/blob"
import { generateClientToken } from "@/lib/blob"

export interface AttachmentUploaderProps {
  onAttach: (url: string, filename: string) => void
}

export function AttachmentUploader({ onAttach }: AttachmentUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Get client token for Vercel Blob
      const { token } = await generateClientToken()

      // Upload to Vercel Blob
      const { url } = await put(file.name, file, {
        access: "public",
        token,
        handleUploadUrl: "/api/blob/upload",
      })

      // Call the onAttach callback with the URL and filename
      onAttach(url, file.name)

      toast({
        title: "File attached",
        description: `${file.name} has been attached to your post.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  return (
    <div>
      <label htmlFor="file-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isUploading}
          asChild
        >
          <span>
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <Paperclip className="h-4 w-4" />
                Attach File
              </>
            )}
          </span>
        </Button>
      </label>
      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
    </div>
  )
}

export default AttachmentUploader
