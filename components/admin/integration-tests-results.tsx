"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface IntegrationTestResultsProps {
  results: any
  loading: boolean
  error: string | null
  onRunTests: () => void
}

const StatusBadge = ({ status }: { status: boolean | undefined }) => {
  if (status === undefined) return <Badge variant="outline">Unknown</Badge>
  return status ? (
    <Badge className="bg-green-500 hover:bg-green-600">Working</Badge>
  ) : (
    <Badge variant="destructive">Failed</Badge>
  )
}

const StatusIcon = ({ status }: { status: boolean | undefined }) => {
  if (status === undefined) return <AlertCircle className="h-5 w-5 text-yellow-500" />
  return status ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
}

export function IntegrationTestResults({ results, loading, error, onRunTests }: IntegrationTestResultsProps) {
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium">Error running tests</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && !results && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Running integration tests...</span>
        </div>
      )}

      {results && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Supabase Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Supabase</CardTitle>
                <CardDescription>Database and Authentication</CardDescription>
              </div>
              <StatusIcon status={results.supabase?.connected} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Connection:</span>
                  <StatusBadge status={results.supabase?.connected} />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Query Test:</span>
                  <StatusBadge status={results.supabase?.queryTest?.success} />
                </div>
                {results.supabase?.error && (
                  <div className="text-sm text-red-500 mt-2">Error: {results.supabase.error}</div>
                )}
                {results.supabase?.queryTest?.error && (
                  <div className="text-sm text-red-500 mt-2">Query Error: {results.supabase.queryTest.error}</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Neon PostgreSQL Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Neon PostgreSQL</CardTitle>
                <CardDescription>Serverless Postgres Database</CardDescription>
              </div>
              <StatusIcon status={results.neon?.connected} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Connection:</span>
                  <StatusBadge status={results.neon?.connected} />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Schema Valid:</span>
                  <StatusBadge status={results.neon?.schemaValid} />
                </div>
                {results.neon?.error && <div className="text-sm text-red-500 mt-2">Error: {results.neon.error}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Upstash Redis Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Upstash Redis</CardTitle>
                <CardDescription>Serverless Redis Cache</CardDescription>
              </div>
              <StatusIcon status={results.redis?.connected} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Connection:</span>
                  <StatusBadge status={results.redis?.connected} />
                </div>
                {results.redis?.health && (
                  <div className="flex justify-between">
                    <span className="font-medium">Health Status:</span>
                    <Badge className={results.redis.health.status === "healthy" ? "bg-green-500" : "bg-red-500"}>
                      {results.redis.health.status}
                    </Badge>
                  </div>
                )}
                {results.redis?.health?.responseTime && (
                  <div className="flex justify-between">
                    <span className="font-medium">Response Time:</span>
                    <span>{results.redis.health.responseTime}</span>
                  </div>
                )}
                {results.redis?.error && <div className="text-sm text-red-500 mt-2">Error: {results.redis.error}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Vercel Blob Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Vercel Blob</CardTitle>
                <CardDescription>File Storage</CardDescription>
              </div>
              <StatusIcon status={results.blob?.working} />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Upload Test:</span>
                  <StatusBadge status={results.blob?.uploadTest?.success} />
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">List Test:</span>
                  <StatusBadge status={results.blob?.listTest?.success} />
                </div>
                {results.blob?.error && <div className="text-sm text-red-500 mt-2">Error: {results.blob.error}</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {results && (
        <div className="mt-6 text-sm text-gray-500">Last updated: {new Date(results.timestamp).toLocaleString()}</div>
      )}
    </div>
  )
}
