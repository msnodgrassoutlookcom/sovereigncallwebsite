import { NextResponse } from "next/server"
import { refreshSession } from "@/lib/session"
import { validateRequest } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    // Validate request body
    const { userId } = await validateRequest(request, {
      userId: "string",
    })

    if (!userId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Refresh the user session
    const success = await refreshSession(userId)

    if (!success) {
      return NextResponse.json({ error: "Failed to refresh session" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Session refresh error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
