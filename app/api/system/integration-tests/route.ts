import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: Request) {
  // Add authentication check
  const user = await getUserFromRequest(request)
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return NextResponse.json({ message: "Integration tests endpoint" })
}
