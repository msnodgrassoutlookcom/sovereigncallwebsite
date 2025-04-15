import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getUserByEmail, updateUserResetToken } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { withRateLimit } from "@/lib/rate-limit"
import { validateAndSanitize } from "@/lib/security"

async function handler(request: Request) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate and sanitize email
    const sanitizedEmail = validateAndSanitize(email, "email")
    if (!sanitizedEmail) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Find user by email
    const user = await getUserByEmail(email)

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If your email is registered, you will receive a password reset link" },
        { status: 200 },
      )
    }

    // Generate reset token
    const resetToken = uuidv4()
    const resetTokenExpiry = new Date()
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1) // Token valid for 1 hour

    // Update user with reset token
    const updated = await updateUserResetToken(user.id, resetToken, resetTokenExpiry.toISOString())

    if (!updated) {
      return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
    }

    // Send email with reset link
    const emailSent = await sendPasswordResetEmail(email, resetToken, user.username)

    if (!emailSent) {
      console.error("Failed to send password reset email")
      // We don't want to reveal this error to the user for security reasons
    }

    return NextResponse.json(
      { message: "If your email is registered, you will receive a password reset link" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export const POST = withRateLimit(handler, {
  limit: 3, window: 60, keyPrefix: 'forgot-password'
})
