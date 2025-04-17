import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET() {
  try {
    // Get metrics from Redis
    const metrics = (await kv.lrange("performance:metrics", 0, 100)) || []

    return NextResponse.json({
      metrics,
      count: metrics.length,
    })
  } catch (error) {
    console.error("Error fetching performance metrics:", error)
    return NextResponse.json({ error: "Failed to fetch performance metrics" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const metric = await request.json()

    // Validate metric data
    if (!metric.name || metric.value === undefined) {
      return NextResponse.json({ error: "Invalid metric data" }, { status: 400 })
    }

    // Add timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now()
    }

    // Store in Redis
    await kv.lpush("performance:metrics", metric)

    // Trim the list to prevent it from growing too large
    await kv.ltrim("performance:metrics", 0, 999)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error storing performance metric:", error)
    return NextResponse.json({ error: "Failed to store performance metric" }, { status: 500 })
  }
}
