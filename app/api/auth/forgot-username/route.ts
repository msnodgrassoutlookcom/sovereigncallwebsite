import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { sendUsernameRecoveryEmail } from "@/lib/email"
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

    const user = await getUserByEmail(email)

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: "If your email is registered, you will receive your username" },
        { status: 200 },
      )
    }

    // Send email with username
    const emailSent = await sendUsernameRecoveryEmail(email, user.username)

    if (!emailSent) {
      console.error("Failed to send username recovery email")
      // We don't want to reveal this error to the user for security reasons
    }

    return NextResponse.json(
      { message: "If your email is registered, you will receive your username" },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot username error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export const POST = withRateLimit(handler, {
 limit: 3, window: 60, keyPrefix: 'forgot-username'
})
