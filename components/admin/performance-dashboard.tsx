"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "lucide-react"

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  page: string
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/system/performance-metrics")
        const data = await response.json()
        setMetrics(data.metrics || [])
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Group metrics by name
  const lcpData = metrics.filter((m) => m.name === "LCP")
  const fidData = metrics.filter((m) => m.name === "FID")
  const clsData = metrics.filter((m) => m.name === "CLS")
  const ttfbData = metrics.filter((m) => m.name === "TTFB")

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <PerformanceCard
        title="Largest Contentful Paint"
        data={lcpData}
        loading={loading}
        valueFormatter={(v) => `${(v / 1000).toFixed(2)}s`}
        threshold={2500} // 2.5s threshold for good LCP
      />
      <PerformanceCard
        title="First Input Delay"
        data={fidData}
        loading={loading}
        valueFormatter={(v) => `${v.toFixed(0)}ms`}
        threshold={100} // 100ms threshold for good FID
      />
      <PerformanceCard
        title="Cumulative Layout Shift"
        data={clsData}
        loading={loading}
        valueFormatter={(v) => v.toFixed(3)}
        threshold={0.1} // 0.1 threshold for good CLS
      />
      <PerformanceCard
        title="Time to First Byte"
        data={ttfbData}
        loading={loading}
        valueFormatter={(v) => `${(v / 1000).toFixed(2)}s`}
        threshold={800} // 800ms threshold for good TTFB
      />
    </div>
  )
}

function PerformanceCard({
  title,
  data,
  loading,
  valueFormatter,
  threshold,
}: {
  title: string
  data: PerformanceMetric[]
  loading: boolean
  valueFormatter: (value: number) => string
  threshold: number
}) {
  const average = data.length ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0

  const isGood = average <= threshold

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[200px] items-center justify-center">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="mb-4 text-2xl font-bold">
              <span className={isGood ? "text-green-500" : "text-red-500"}>{valueFormatter(average)}</span>
            </div>
            <div className="h-[200px] w-full">
              {/* Simple chart visualization */}
              <div className="flex h-full items-end space-x-1">
                {data.slice(-20).map((item, i) => {
                  const heightPercent = Math.min((item.value / (threshold * 2)) * 100, 100)
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div
                        className={`w-full ${item.value <= threshold ? "bg-green-500" : "bg-red-500"}`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                      {i % 5 === 0 && (
                        <div className="text-xs mt-1 transform -rotate-45 origin-top-left">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-center text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
