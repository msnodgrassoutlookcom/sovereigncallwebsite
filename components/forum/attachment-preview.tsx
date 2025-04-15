"use client"

import { Button } from "@/components/ui/button"
import { FileIcon, X } from "lucide-react"
import Image from "next/image"

export interface AttachmentPreviewProps {
  url: string
  filename: string
  onRemove: () => void
}

export function AttachmentPreview({ url, filename, onRemove }: AttachmentPreviewProps) {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename)

  return (
    <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/30">
      {isImage ? (
        <div className="relative h-12 w-12 overflow-hidden rounded-md">
          <Image src={url || "/placeholder.svg"} alt={filename} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{filename}</p>
        <p className="text-xs text-muted-foreground">{isImage ? "Image" : "File"} attachment</p>
      </div>
      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRemove}>
        <X className="h-4 w-4" />
        <span className="sr-only">Remove attachment</span>
      </Button>
    </div>
  )
}

export default AttachmentPreview
