"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, Loader2, User } from "lucide-react"
import { uploadFile } from "@/lib/blob"
import { useAuth } from "@/context/auth-context"

interface ProfilePictureUploaderProps {
  currentPictureUrl?: string
  onUploadSuccess: (url: string) => void
}

export function ProfilePictureUploader({ currentPictureUrl, onUploadSuccess }: ProfilePictureUploaderProps) {
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPictureUrl || null)
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
        throw new Error("You must be logged in to upload a profile picture")
      }

      // Generate a unique filename
      const fileExtension = file.name.split(".").pop()
      const filename = `${user.id}-${Date.now()}.${fileExtension}`

      // Upload to Blob storage
      const result = await uploadFile(file, filename, "profile-pictures")

      // Call the success callback with the URL
      onUploadSuccess(result.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image")
      // Reset preview if upload fails
      if (currentPictureUrl) {
        setPreviewUrl(currentPictureUrl)
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
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Upload a profile picture to personalize your account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Avatar className="h-32 w-32">
          <AvatarImage src={previewUrl || undefined} alt="Profile" />
          <AvatarFallback className="text-4xl">
            <User />
          </AvatarFallback>
        </Avatar>

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
              <Upload className="mr-2 h-4 w-4" /> Upload Picture
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
