"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts"
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown, Percent, Server } from "lucide-react"

interface CacheStats {
  hits: number
  misses: number
  total: number
  hitRate: number
}

interface HistoricalDataPoint {
  timestamp: number
  hits: number
  misses: number
  total: number
  hitRate: number
}

interface CacheStatsResponse {
  timestamp: string
  local: CacheStats
  redis: CacheStats | null
  historical: HistoricalDataPoint[] | null
}

export default function CacheHitRateChart() {
  const [stats, setStats] = useState<CacheStatsResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState<number>(0)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/system/cache-stats")

      if (!response.ok) {
        throw new Error(`Failed to fetch cache stats: ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching cache stats:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Set up automatic refresh every 30 seconds
    const intervalId = setInterval(fetchStats, 30000)

    return () => clearInterval(intervalId)
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatLongDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // Calculate trend (compared to first data point)
  const calculateTrend = (data: HistoricalDataPoint[] | null) => {
    if (!data || data.length < 2) return { trend: 0, isUp: false }

    const oldest = data[data.length - 1].hitRate
    const newest = data[0].hitRate
    const difference = newest - oldest

    return {
      trend: Math.abs(difference).toFixed(2),
      isUp: difference >= 0,
    }
  }

  // Get color based on hit rate
  const getHitRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-500"
    if (rate >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const trend = stats?.historical ? calculateTrend(stats.historical) : null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Cache Hit Rate</CardTitle>
            <CardDescription>Performance metrics for Redis cache</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loading && !stats ? (
          <div className="flex items-center justify-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <span className="ml-2">Loading statistics...</span>
          </div>
        ) : (
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Current Hit Rate</h3>
                    </div>
                    <div className={`mt-2 text-2xl font-bold ${getHitRateColor(stats?.redis?.hitRate || 0)}`}>
                      {stats?.redis?.hitRate || 0}%
                    </div>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-purple-500" />
                      <h3 className="font-medium">Total Requests</h3>
                    </div>
                    <div className="mt-2 text-2xl font-bold">{stats?.redis?.total?.toLocaleString() || 0}</div>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                      {trend?.isUp ? (
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-500" />
                      )}
                      <h3 className="font-medium">Trend (24h)</h3>
                    </div>
                    <div className={`mt-2 text-2xl font-bold ${trend?.isUp ? "text-green-500" : "text-red-500"}`}>
                      {trend?.trend || 0}%
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-[300px] rounded-lg border p-4">
                  {stats?.historical && stats.historical.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...stats.historical].reverse()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={30} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Hit Rate"]}
                          labelFormatter={(label) => formatLongDate(label as number)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="hitRate"
                          name="Cache Hit Rate"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                      <p className="mb-2">No historical data available yet.</p>
                      <p className="text-sm">Data will be collected every 5 minutes.</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-medium">Redis Cache Statistics</h3>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Cache Hits</div>
                      <div className="text-right">{stats?.redis?.hits.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Cache Misses</div>
                      <div className="text-right">{stats?.redis?.misses.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Total Requests</div>
                      <div className="text-right">{stats?.redis?.total.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <div className="font-medium">Hit Rate</div>
                      <div className="text-right">{stats?.redis?.hitRate || 0}%</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium">In-Memory Cache Statistics</h3>
                  <div className="rounded-lg border">
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Cache Hits</div>
                      <div className="text-right">{stats?.local.hits.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Cache Misses</div>
                      <div className="text-right">{stats?.local.misses.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b p-3">
                      <div className="font-medium">Total Requests</div>
                      <div className="text-right">{stats?.local.total.toLocaleString() || 0}</div>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <div className="font-medium">Hit Rate</div>
                      <div className="text-right">{stats?.local.hitRate || 0}%</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Last updated: {stats?.timestamp ? new Date(stats.timestamp).toLocaleString() : "Never"}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="border-t px-6 py-4">
        <div className="text-xs text-muted-foreground">
          Higher cache hit rates indicate better performance and reduced database load. Consider optimizing cache TTLs
          if hit rate is below 70%.
        </div>
      </CardFooter>
    </Card>
  )
}
