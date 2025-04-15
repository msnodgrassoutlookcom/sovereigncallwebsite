"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugAuthPage() {
  const { user, isLoggedIn, loading, logout } = useAuth()
  const [localStorageData, setLocalStorageData] = useState<string | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user")
    setLocalStorageData(userData)
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Auth Debug</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Auth Context State:</h3>
              <div className="bg-gray-100 p-4 rounded">
                <p>
                  <strong>Loading:</strong> {loading ? "True" : "False"}
                </p>
                <p>
                  <strong>Is Logged In:</strong> {isLoggedIn ? "True" : "False"}
                </p>
                <p>
                  <strong>User:</strong> {user ? user.username : "None"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">User Object:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                {user ? JSON.stringify(user, null, 2) : "No user"}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">LocalStorage Data:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                {localStorageData ? JSON.stringify(JSON.parse(localStorageData), null, 2) : "No data"}
              </pre>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {isLoggedIn ? (
            <Button onClick={logout}>Logout</Button>
          ) : (
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          )}
          <Button variant="outline" onClick={() => (window.location.href = "/test-register")}>
            Test Registration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
