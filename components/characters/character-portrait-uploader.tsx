"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, Loader2, User } from "lucide-react"
import { uploadFile } from "@/lib/blob"
import { useAuth } from "@/context/auth-context"

interface CharacterPortraitUploaderProps {
  characterId: string
  characterName: string
  currentPortraitUrl?: string
  onUploadSuccess: (url: string) => void
}

export function CharacterPortraitUploader({
  characterId,
  characterName,
  currentPortraitUrl,
  onUploadSuccess,
}: CharacterPortraitUploaderProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPortraitUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    setIsUploading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error("You must be logged in to upload a character portrait")
      }

      // Generate a unique filename
      const fileExtension = file.name.split(".").pop()
      const filename = `${characterId}-${Date.now()}.${fileExtension}`

      // Upload to Blob storage
      const result = await uploadFile(file, filename, "character-portraits")

      // Call the success callback with the URL
      onUploadSuccess(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
      // Reset preview if upload fails
      if (currentPortraitUrl) {
        setPreviewUrl(currentPortraitUrl)
      } else {
        setPreviewUrl(null)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Character Portrait</CardTitle>
        <CardDescription>Upload a portrait for {characterName}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-64 w-48 overflow-hidden rounded-md border">
          {previewUrl ? (
            <img
              src={previewUrl || "/placeholder.svg"}
              alt={`Portrait of ${characterName}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <User className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Upload Portrait
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
