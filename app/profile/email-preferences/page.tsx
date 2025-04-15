"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function EmailPreferencesPage() {
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [preferences, setPreferences] = useState({
    email_verification: true,
    password_reset: true,
    welcome: true,
    character_creation: true,
    forum_replies: true,
    forum_mentions: true,
    forum_reactions: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login?redirect=/profile/email-preferences")
    } else if (user?.notificationPreferences) {
      // Load user preferences
      setPreferences({
        email_verification: user.notificationPreferences.email_verification ?? true,
        password_reset: user.notificationPreferences.password_reset ?? true,
        welcome: user.notificationPreferences.welcome ?? true,
        character_creation: user.notificationPreferences.character_creation ?? true,
        forum_replies: user.notificationPreferences.forum_replies ?? true,
        forum_mentions: user.notificationPreferences.forum_mentions ?? true,
        forum_reactions: user.notificationPreferences.forum_reactions ?? true,
      })
    }
  }, [isLoggedIn, router, user])

  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          preferences,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update notification preferences")
      }

      setSuccess(true)
      toast({
        title: "Preferences Updated",
        description: "Your email notification preferences have been updated successfully.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoggedIn) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/profile">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">Email Preferences</h1>
          <p className="mt-4 text-xl text-muted-foreground">Manage your email notification settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Choose which emails you want to receive from Sovereign Call</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500 bg-green-50 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Your notification preferences have been updated successfully.</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email_verification">Email Verification</Label>
                    <p className="text-sm text-muted-foreground">Receive emails to verify your email address</p>
                  </div>
                  <Switch
                    id="email_verification"
                    checked={preferences.email_verification}
                    onCheckedChange={() => handleToggleChange("email_verification")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password_reset">Password Reset</Label>
                    <p className="text-sm text-muted-foreground">Receive emails to reset your password</p>
                  </div>
                  <Switch
                    id="password_reset"
                    checked={preferences.password_reset}
                    onCheckedChange={() => handleToggleChange("password_reset")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="welcome">Welcome Email</Label>
                    <p className="text-sm text-muted-foreground">Receive a welcome email when you create an account</p>
                  </div>
                  <Switch
                    id="welcome"
                    checked={preferences.welcome}
                    onCheckedChange={() => handleToggleChange("welcome")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="character_creation">Character Creation</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive confirmation emails when you create a new character
                    </p>
                  </div>
                  <Switch
                    id="character_creation"
                    checked={preferences.character_creation}
                    onCheckedChange={() => handleToggleChange("character_creation")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forum_replies">Forum Replies</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone replies to your forum threads
                    </p>
                  </div>
                  <Switch
                    id="forum_replies"
                    checked={preferences.forum_replies}
                    onCheckedChange={() => handleToggleChange("forum_replies")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forum_mentions">Forum Mentions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone mentions you in a forum post
                    </p>
                  </div>
                  <Switch
                    id="forum_mentions"
                    checked={preferences.forum_mentions}
                    onCheckedChange={() => handleToggleChange("forum_mentions")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="forum_reactions">Forum Reactions</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when someone reacts to your forum posts
                    </p>
                  </div>
                  <Switch
                    id="forum_reactions"
                    checked={preferences.forum_reactions}
                    onCheckedChange={() => handleToggleChange("forum_reactions")}
                  />
                </div>
              </div>

              <div className="mt-8">
                <Button type="submit" className="gap-2" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
