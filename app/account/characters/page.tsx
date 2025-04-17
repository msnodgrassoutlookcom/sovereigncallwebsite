"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function CharactersPage() {
  const { isLoggedIn, user, deleteCharacter, loading } = useAuth()
  const router = useRouter()

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn && !loading) {
      router.push("/login")
    }
  }, [isLoggedIn, router, loading])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null // Don't render anything while redirecting
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
                    <Link href={`/character-builder?edit=${character.id}`}>
                      <Button variant="outline" size="sm" className="gap-1">
                        <Edit className="h-4 w-4" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => deleteCharacter(character.id)}
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
