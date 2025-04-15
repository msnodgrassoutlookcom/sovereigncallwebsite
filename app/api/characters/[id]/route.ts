import { NextResponse } from "next/server"
import { deleteCharacter } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await deleteCharacter(userId, id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
    }

    return NextResponse.json({ message: "Character deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete character error:", error)
    return NextResponse.json({ error: "Failed to delete character" }, { status: 500 })
  }
}
