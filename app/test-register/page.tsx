"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function TestRegisterPage() {
  const [username, setUsername] = useState("testuser" + Math.floor(Math.random() * 10000))
  const [email, setEmail] = useState(`test${Math.floor(Math.random() * 10000)}@example.com`)
  const [password, setPassword] = useState("password123")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Update the database check handling to be more robust
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setResponse(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      // First check database connection
      let dbCheckData
      try {
        const dbCheckResponse = await fetch("/api/system/db-check")
        dbCheckData = await dbCheckResponse.json()
        setDebugInfo(dbCheckData)
      } catch (dbCheckError) {
        console.error("Database check failed:", dbCheckError)
        setDebugInfo({ error: dbCheckError instanceof Error ? dbCheckError.message : String(dbCheckError) })
        setError(
          "Database check failed: " + (dbCheckError instanceof Error ? dbCheckError.message : String(dbCheckError)),
        )
        setIsLoading(false)
        return
      }

      if (!dbCheckData.success) {
        setError("Database connection issue: " + JSON.stringify(dbCheckData.error || "Unknown error"))
        setIsLoading(false)
        return
      }

      // Try to register with simplified endpoint
      const registerResponse = await fetch("/api/auth/simple-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      })

      const data = await registerResponse.json()
      setResponse(data)

      if (registerResponse.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Failed to register")
      }
    } catch (err) {
      setError("An unexpected error occurred: " + (err instanceof Error ? err.message : String(err)))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Test Registration</CardTitle>
          <CardDescription>Diagnostic tool to test user registration</CardDescription>
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
              <AlertDescription>Registration successful!</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="text" // Using text instead of password for debugging
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Testing Registration..." : "Test Register"}
            </Button>
          </form>

          {debugInfo && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Database Check Results:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {response && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">API Response:</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/signup")}>
            Go to Regular Signup
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
