"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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
        setMetrics(data.metrics)
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="mb-4 text-2xl font-bold">
              <span className={isGood ? "text-green-500" : "text-red-500"}>{valueFormatter(average)}</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [valueFormatter(value), title]}
                  labelFormatter={(ts) => new Date(Number(ts)).toLocaleString()}
                />
                <Line type="monotone" dataKey="value" stroke={isGood ? "#10b981" : "#ef4444"} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
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
