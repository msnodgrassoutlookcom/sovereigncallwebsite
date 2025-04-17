"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function CharactersPage() {
  const { isLoggedIn, user, deleteCharacter, loading, refreshAuth } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
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
        router.push("/login?redirect=/account/characters")
        return
      }

      // Refresh auth session
      await refreshAuth()
      setPageLoading(false)
    }

    checkAuth()
  }, [isLoggedIn, loading, refreshAuth, router])

  const handleDeleteCharacter = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      const success = await deleteCharacter(id)

      if (success) {
        toast({
          title: "Character Deleted",
          description: `${name} has been deleted from your account.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete character. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Show loading state
  if (pageLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading your characters...</p>
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
        <Link href="/account">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Account
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold md:text-5xl">My Characters</h1>
          <p className="mt-4 text-xl text-muted-foreground">Manage your saved characters</p>
        </div>

        <div className="mb-6 flex justify-between">
          <p className="text-muted-foreground">{user?.characters.length || 0} of 2 character slots used</p>
          {(user?.characters.length || 0) < 2 && (
            <Link href="/character-builder">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create New Character
              </Button>
            </Link>
          )}
        </div>

        {user?.characters && user.characters.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {user.characters.map((character) => (
              <Card key={character.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{character.name}</CardTitle>
                    <span
                      className={
                        character.faction === "dominion"
                          ? "rounded-full bg-amber-950 px-2 py-1 text-xs text-amber-400"
                          : "rounded-full bg-blue-950 px-2 py-1 text-xs text-blue-400"
                      }
                    >
                      {character.faction === "dominion" ? "Dominion" : "Reformation"}
                    </span>
                  </div>
                  <CardDescription>Created on {new Date(character.createdAt).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="mb-2 grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Gender</p>
                        <p>{character.gender === "male" ? "Male" : "Female"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Combat Class</p>
                        <p className="capitalize">{character.combatClass}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Story Class</p>
                      <p className="capitalize">{character.storyClass}</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <Link href={`/character-builder?edit=${character.id}`}>
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => handleDeleteCharacter(character.id, character.name)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
            <p className="mb-4 text-center text-muted-foreground">You haven't created any characters yet.</p>
            <Link href="/character-builder">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Your First Character
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
