import { NextResponse } from "next/server"
import { getMetrics } from "@/lib/metrics"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Only allow admins to access metrics
    const user = await getUserFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const url = new URL(request.url)
    const name = url.searchParams.get("name") || "cache.access"
    const limit = Number.parseInt(url.searchParams.get("limit") || "100", 10)

    const metrics = await getMetrics(name, limit)

    // Process metrics for visualization
    const processedMetrics = processMetrics(metrics)

    return NextResponse.json({
      raw: metrics,
      processed: processedMetrics,
    })
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 })
  }
}

function processMetrics(metrics: any[]) {
  if (!metrics.length) return {}

  // Group by tags
  const grouped: Record<string, any[]> = {}

  metrics.forEach((metric) => {
    const key = metric.tags
      ? Object.entries(metric.tags)
          .map(([k, v]) => `${k}:${v}`)
          .join(",")
      : "default"

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push({
      value: metric.value,
      timestamp: metric.timestamp,
    })
  })

  // Calculate statistics for each group
  const result: Record<string, any> = {}

  Object.entries(grouped).forEach(([key, values]) => {
    const numValues = values.map((v) => v.value)

    result[key] = {
      count: values.length,
      sum: numValues.reduce((a, b) => a + b, 0),
      avg: numValues.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...numValues),
      max: Math.max(...numValues),
      values: values.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20),
    }
  })

  return result
}
