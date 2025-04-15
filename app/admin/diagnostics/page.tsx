"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, BarChart3 } from "lucide-react"

interface DiagnosticsData {
  status: string
  timestamp: string
  environment: {
    valid: boolean
    masked: {
      server: Record<string, string | null>
      client: Record<string, string | null>
    }
  }
  database: {
    connected: boolean
    connectionError: string | null
    schemaValid: boolean
    schemaError: string | null
  }
  email: {
    configured: boolean
  }
}

export default function DiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/system/diagnostics")

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const diagnosticsData = await response.json()
      setData(diagnosticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch diagnostics")
      console.error("Diagnostics fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Diagnostics</h1>
        <Button onClick={fetchDiagnostics} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && !data && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Last checked: {new Date(data.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusCard
                  title="Environment Variables"
                  status={data.environment.valid}
                  description={data.environment.valid ? "All required variables are set" : "Missing required variables"}
                />
                <StatusCard
                  title="Database Connection"
                  status={data.database.connected}
                  description={data.database.connectionError || "Connected successfully"}
                />
                <StatusCard
                  title="Database Schema"
                  status={data.database.schemaValid}
                  description={data.database.schemaError || "Schema is valid"}
                />
                <StatusCard
                  title="Email Configuration"
                  status={data.email.configured}
                  description={data.email.configured ? "Email is configured" : "Email is not configured"}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="environment">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="environment">
              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                  <CardDescription>Configuration status for server and client environment variables</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="server">
                    <TabsList className="mb-4">
                      <TabsTrigger value="server">Server</TabsTrigger>
                      <TabsTrigger value="client">Client</TabsTrigger>
                    </TabsList>

                    <TabsContent value="server">
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Variable</th>
                              <th className="text-left p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(data.environment.masked.server).map(([key, value]) => (
                              <tr key={key} className="border-b">
                                <td className="p-2 font-mono text-sm">{key}</td>
                                <td className="p-2">
                                  {value ? (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-2" /> Set
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-red-600">
                                      <AlertCircle className="h-4 w-4 mr-2" /> Missing
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="client">
                      <div className="border rounded-md">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Variable</th>
                              <th className="text-left p-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(data.environment.masked.client).map(([key, value]) => (
                              <tr key={key} className="border-b">
                                <td className="p-2 font-mono text-sm">{key}</td>
                                <td className="p-2">
                                  {value ? (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircle className="h-4 w-4 mr-2" /> Set
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-red-600">
                                      <AlertCircle className="h-4 w-4 mr-2" /> Missing
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Note: Sensitive values are masked for security reasons.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                  <CardDescription>Connection and schema validation results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Connection Status</h3>
                      {data.database.connected ? (
                        <Alert className="bg-green-50 border-green-500 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Connected</AlertTitle>
                          <AlertDescription>Successfully connected to the database.</AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Connection Failed</AlertTitle>
                          <AlertDescription>
                            {data.database.connectionError || "Unknown connection error"}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Schema Status</h3>
                      {data.database.schemaValid ? (
                        <Alert className="bg-green-50 border-green-500 text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <AlertTitle>Schema Valid</AlertTitle>
                          <AlertDescription>
                            Database schema is valid and contains all required tables and columns.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Schema Issues</AlertTitle>
                          <AlertDescription>{data.database.schemaError || "Unknown schema error"}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>Status of email service configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.email.configured ? (
                    <Alert className="bg-green-50 border-green-500 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Email Configured</AlertTitle>
                      <AlertDescription>Email service is properly configured.</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Email Not Configured</AlertTitle>
                      <AlertDescription>
                        Email service is not properly configured. Please check your environment variables.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex justify-center">
            <Link href="/admin/cache-dashboard">
              <Button className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View Cache Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCard({ title, status, description }: { title: string; status: boolean; description: string }) {
  return (
    <div className={`p-4 rounded-lg border ${status ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-center mb-2">
        {status ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
        )}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className={`text-sm ${status ? "text-green-700" : "text-red-700"}`}>{description}</p>
    </div>
  )
}
