"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"

export default function NewThreadPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get("category") || ""

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState(defaultCategory)

  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/forum/new-thread")
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null // Will redirect in useEffect
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the thread to the server
    alert(`Thread created: ${title} in category ${category}`)
    router.push(`/forum/${category}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/forum">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">Create New Thread</h1>
          <p className="mt-4 text-xl text-muted-foreground">Start a new discussion in the Sovereign Call community</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Thread Details</CardTitle>
              <CardDescription>Provide a clear title and detailed content to get the best responses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lore">Lore & Story</SelectItem>
                    <SelectItem value="gameplay">Gameplay & Mechanics</SelectItem>
                    <SelectItem value="suggestions">Suggestions & Ideas</SelectItem>
                    <SelectItem value="questions">General Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Thread Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim() || !content.trim() || !category}>
                Create Thread
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
