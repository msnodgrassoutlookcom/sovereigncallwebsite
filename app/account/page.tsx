"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  displayName: string
  bio: string
  favoriteClass: string
  favoriteFaction: string
}

export default function AccountPage() {
  const { isLoggedIn, user, deleteCharacter, loading, refreshAuth } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    bio: "",
    favoriteClass: "",
    favoriteFaction: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  // Enhanced auth check with refresh
  useEffect(() => {
    const checkAuth = async () => {
      setPageLoading(true)

      // Wait for auth context to initialize
      if (loading) {
        return
      }

      if (!isLoggedIn) {
        // Redirect to login if not logged in
        router.push("/login?redirect=/account")
        return
      }

      // Refresh auth session
      await refreshAuth()

      // Load profile from localStorage if it exists
      if (user) {
        const storedProfile = localStorage.getItem(`sovereignCallProfile_${user.id}`)
        if (storedProfile) {
          try {
            setProfile(JSON.parse(storedProfile))
          } catch (error) {
            console.error("Error parsing stored profile:", error)
          }
        }
      }

      setPageLoading(false)
    }

    checkAuth()
  }, [isLoggedIn, loading, refreshAuth, router, user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // In a real app, this would be an API call
      localStorage.setItem(`sovereignCallProfile_${user?.id}`, JSON.stringify(profile))

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCharacter = useCallback(
    (characterId: string, characterName: string) => {
      deleteCharacter(characterId)
      toast({
        title: "Character Deleted",
        description: `${characterName} has been deleted.`,
      })
    },
    [deleteCharacter, toast],
  )

  // Show loading state
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading your account...</p>
        </div>
      </div>
    )
  }

  // If not logged in, the redirect will happen in useEffect
  if (!isLoggedIn || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">Account Settings</h1>
          <p className="mt-4 text-xl text-muted-foreground">Manage your Sovereign Call profile and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={user?.username} disabled />
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={profile.displayName}
                      onChange={handleChange}
                      placeholder="How you want to be known in the community"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself and your interest in Sovereign Call"
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="favoriteClass">Favorite Class</Label>
                      <select
                        id="favoriteClass"
                        name="favoriteClass"
                        value={profile.favoriteClass}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">Select a class</option>
                        <option value="striker">Striker</option>
                        <option value="warden">Warden</option>
                        <option value="veilrunner">Veilrunner</option>
                        <option value="arbiter">Arbiter</option>
                        <option value="vanguard">Vanguard</option>
                        <option value="seraph">Seraph</option>
                        <option value="bastion">Bastion</option>
                        <option value="revenant">Revenant</option>
                        <option value="neuralcaster">Neuralcaster</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="favoriteFaction">Favorite Faction</Label>
                      <select
                        id="favoriteFaction"
                        name="favoriteFaction"
                        value={profile.favoriteFaction}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">Select a faction</option>
                        <option value="dominion">The Dominion</option>
                        <option value="reformation">The Reformation</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" className="gap-2" disabled={isSaving}>
                    <Save className="h-4 w-4" /> {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters">
            <Card>
              <CardHeader>
                <CardTitle>Your Characters</CardTitle>
                <CardDescription>View and manage your saved characters</CardDescription>
              </CardHeader>
              <CardContent>
                {user?.characters && user.characters.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {user.characters.map((character) => (
                      <div key={character.id} className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold">{character.name}</h3>
                          <span className={character.faction === "dominion" ? "text-amber-500" : "text-blue-400"}>
                            {character.faction === "dominion" ? "Dominion" : "Reformation"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {character.gender === "male" ? "Male" : "Female"} {character.combatClass}{" "}
                          {character.storyClass}
                        </p>
                        <div className="mt-4 flex justify-between">
                          <Link href={`/character-builder?edit=${character.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              handleDeleteCharacter(character.id, character.name)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="mb-4 text-center text-muted-foreground">You haven't created any characters yet.</p>
                    <Link href="/character-builder">
                      <Button>Create Your First Character</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
