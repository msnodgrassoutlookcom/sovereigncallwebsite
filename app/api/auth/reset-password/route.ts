import { NextResponse } from "next/server"
import { getUserByResetToken, updateUserPassword } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 })
    }

    // Find user by reset token
    const user = await getUserByResetToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
    }

    // Update user password and clear reset token
    const updated = await updateUserPassword(user.id, newPassword)

    if (!updated) {
      return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({ message: "Password has been reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 })
  }
}
