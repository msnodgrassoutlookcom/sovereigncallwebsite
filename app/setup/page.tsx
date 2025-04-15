"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Copy } from "lucide-react"

export default function SetupPage() {
  const searchParams = useSearchParams()
  const missingParams = searchParams?.get("missing")?.split(",") || []

  const [formData, setFormData] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Initialize form data with empty values for missing params
    const initialData: Record<string, string> = {}
    missingParams.forEach((param) => {
      initialData[param] = ""
    })
    setFormData(initialData)
  }, [missingParams])

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const generateEnvFile = () => {
    let envContent = "# Environment variables for Sovereign's Call\n\n"

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        envContent += `${key}=${value}\n`
      }
    })

    return envContent
  }

  const copyToClipboard = () => {
    const envContent = generateEnvFile()
    navigator.clipboard.writeText(envContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Setup Required</CardTitle>
          <CardDescription>
            Your Sovereign's Call site needs some configuration before it can work properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Environment Variables</AlertTitle>
            <AlertDescription>
              The following environment variables are missing from your configuration:
              <ul className="list-disc pl-5 mt-2">
                {missingParams.map((param) => (
                  <li key={param}>{param}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Enter your environment variables:</h3>

            {missingParams.map((param) => (
              <div key={param} className="space-y-2">
                <Label htmlFor={param}>{param}</Label>
                <Input
                  id={param}
                  placeholder={`Enter your ${param}`}
                  value={formData[param] || ""}
                  onChange={(e) => handleInputChange(param, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-medium">How to fix this:</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Fill in the values for each environment variable above</li>
              <li>Click the "Copy .env File" button below</li>
              <li>
                Create or update your <code>.env</code> file with these values
              </li>
              <li>Restart your application</li>
            </ol>
          </div>

          {copied && (
            <Alert className="bg-green-50 border-green-500 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Copied to clipboard!</AlertTitle>
              <AlertDescription>Paste this into your .env file and restart your application.</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={copyToClipboard} className="w-full">
            <Copy className="mr-2 h-4 w-4" />
            Copy .env File
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
