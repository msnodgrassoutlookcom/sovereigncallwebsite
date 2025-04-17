"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, loading } = useAuth()

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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Your Profile</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Username:</span> {user.username}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Account Created:</span> {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/change-password")}>
              Change Password
            </Button>
          </CardFooter>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Characters</CardTitle>
            <CardDescription>Characters you have created</CardDescription>
          </CardHeader>
          <CardContent>
            {user.characters.length === 0 ? (
              <p>You haven&apos;t created any characters yet.</p>
            ) : (
              <div className="space-y-4">
                {user.characters.map((character) => (
                  <div key={character.id} className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium">{character.name}</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Faction:</span>{" "}
                        <span className="capitalize">{character.faction || "None"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Gender:</span>{" "}
                        <span className="capitalize">{character.gender || "None"}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Combat Class:</span>{" "}
                        {character.combatClass || "None"}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Story Class:</span>{" "}
                        {character.storyClass || "None"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/character-builder")}>
              {user.characters.length === 0 ? "Create Character" : "Manage Characters"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
