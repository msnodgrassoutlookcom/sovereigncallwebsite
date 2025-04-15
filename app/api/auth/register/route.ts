import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { hashPassword } from "@/lib/auth-utils"
import { sendVerificationEmail } from "@/lib/email"
import { getClientIp, validateAndSanitize, detectSuspiciousActivity } from "@/lib/security"
import { getRedisClient } from "@/lib/redis"
import { generateEmailVerificationToken } from "@/lib/auth-utils"

// Rate limiting configuration
const MAX_REGISTER_ATTEMPTS = 3
const REGISTER_WINDOW = 60 * 60 // 1 hour in seconds

export async function POST(request: Request) {
  try {
    console.log("Registration API called")
    const { username, password, email } = await request.json()
    console.log("Registration data:", { username, email, passwordLength: password?.length })

    // Validate input
    if (!username || !password || !email) {
      console.log("Registration failed: Missing required fields")
      return NextResponse.json({ error: "Username, password, and email are required" }, { status: 400 })
    }

    // Validate and sanitize inputs
    const sanitizedUsername = validateAndSanitize(username, "username")
    const sanitizedEmail = validateAndSanitize(email, "email")

    if (!sanitizedUsername) {
      return NextResponse.json(
        { error: "Invalid username format. Use 3-30 alphanumeric characters, underscores, or hyphens." },
        { status: 400 },
      )
    }

    if (!sanitizedEmail) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one uppercase letter" }, { status: 400 })
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one lowercase letter" }, { status: 400 })
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ error: "Password must contain at least one number" }, { status: 400 })
    }

    // Get client IP for rate limiting
    const ip = getClientIp(request)

    // Check rate limiting with Redis
    const redis = getRedisClient()
    if (redis) {
      const rateLimitKey = `ratelimit:register:${ip}`
      const attempts = (await redis.get<number>(rateLimitKey)) || 0

      if (attempts >= MAX_REGISTER_ATTEMPTS) {
        // Log suspicious activity
        await detectSuspiciousActivity("anonymous", "register:rate-limit", ip)

        return NextResponse.json(
          {
            error: "Too many registration attempts. Please try again later.",
          },
          { status: 429 },
        )
      }

      // Increment attempt counter
      if (attempts === 0) {
        await redis.set(rateLimitKey, 1, { ex: REGISTER_WINDOW })
      } else {
        await redis.incr(rateLimitKey)
      }
    }

    try {
      const supabase = createServerSupabaseClient()

      // Check if username exists
      console.log("Checking if username exists:", sanitizedUsername)
      const { data: existingUsername, error: usernameError } = await supabase
        .from("users")
        .select("id")
        .ilike("username", sanitizedUsername)
        .maybeSingle()

      if (usernameError) {
        console.error("Error checking username:", usernameError)
        return NextResponse.json(
          { error: "Database error when checking username", details: usernameError },
          { status: 500 },
        )
      }

      if (existingUsername) {
        console.log(`Username '${sanitizedUsername}' already exists`)
        return NextResponse.json({ error: "Username already exists" }, { status: 409 })
      }

      // Check if email exists
      console.log("Checking if email exists:", sanitizedEmail)
      const { data: existingEmail, error: emailError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", sanitizedEmail)
        .maybeSingle()

      if (emailError) {
        console.error("Error checking email:", emailError)
        return NextResponse.json({ error: "Database error when checking email", details: emailError }, { status: 500 })
      }

      if (existingEmail) {
        console.log(`Email '${sanitizedEmail}' already exists`)
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }

      // Hash password
      console.log("Hashing password")
      let hashedPassword
      try {
        hashedPassword = await hashPassword(password)
      } catch (hashError) {
        console.error("Error hashing password:", hashError)
        return NextResponse.json({ error: "Error processing password" }, { status: 500 })
      }

      // Create user
      const userId = uuidv4()

      // Generate verification token
      const verificationToken = await generateEmailVerificationToken(userId)

      console.log("Creating user with ID:", userId)

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          username: sanitizedUsername,
          password: hashedPassword,
          email: sanitizedEmail,
          created_at: new Date().toISOString(),
          email_verified: false,
          verification_token: verificationToken,
          notification_preferences: {
            email_verification: true,
            password_reset: true,
            welcome: true,
            character_creation: true,
            forum_replies: true,
            forum_mentions: true,
            forum_reactions: true,
          },
        })
        .select()

      if (insertError) {
        console.error("Error inserting user:", insertError)
        return NextResponse.json({ error: "Failed to create user", details: insertError.message }, { status: 500 })
      }

      console.log("User created successfully")

      // Send verification email
      try {
        await sendVerificationEmail(sanitizedEmail, verificationToken, sanitizedUsername)
        console.log("Verification email sent successfully")
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError)
        // Continue with registration even if email fails
      }

      // Reset rate limit counter on successful registration
      if (redis) {
        const rateLimitKey = `ratelimit:register:${ip}`
        await redis.del(rateLimitKey)
      }

      return NextResponse.json(
        {
          success: true,
          user: {
            id: userId,
            username: sanitizedUsername,
            email: sanitizedEmail,
            emailVerified: false,
          },
        },
        { status: 201 },
      )
    } catch (dbError) {
      console.error("Database operation failed:", dbError)
      return NextResponse.json(
        { error: "Database operation failed", details: dbError instanceof Error ? dbError.message : String(dbError) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Failed to register user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
