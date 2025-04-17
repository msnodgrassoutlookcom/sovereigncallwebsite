"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { IntegrationTestResults } from "@/components/admin/integration-tests-results"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function IntegrationTestsPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runTests = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/system/integration-tests")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || "Unknown error"}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      console.error("Error running integration tests:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Integration Tests</h1>
        <Button onClick={runTests} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Running Tests..." : "Run Tests Again"}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <IntegrationTestResults results={results} loading={loading} error={error} onRunTests={runTests} />
    </div>
  )
}
