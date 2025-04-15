import { NextResponse } from "next/server"
import { getUserByVerificationToken, verifyUserEmail } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    // Validate input
    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user by verification token
    const user = await getUserByVerificationToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Check if token is expired
    if (!user.verificationTokenExpiry || new Date(user.verificationTokenExpiry) < new Date()) {
      return NextResponse.json({ error: "Verification token has expired" }, { status: 400 })
    }

    // Update user email verification status
    const verified = await verifyUserEmail(user.id)

    if (!verified) {
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
    }

    // Send welcome email if notification preference is enabled
    if (user.notificationPreferences?.welcome) {
      await sendWelcomeEmail(user.email, user.username)
    }

    return NextResponse.json({ message: "Email verified successfully" }, { status: 200 })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
