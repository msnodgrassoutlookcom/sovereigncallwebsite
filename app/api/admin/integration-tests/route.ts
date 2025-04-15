import { NextResponse } from "next/server"
import { testAllIntegrations } from "@/lib/integration-tests"

export async function GET() {
  try {
    const results = await testAllIntegrations()

    return NextResponse.json(results)
  } catch (error) {
    console.error("Integration tests error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
