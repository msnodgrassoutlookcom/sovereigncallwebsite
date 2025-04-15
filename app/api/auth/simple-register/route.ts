import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    console.log("Simple Registration API called")
    const { username, password, email } = await request.json()
    console.log("Registration data:", { username, email, passwordLength: password?.length })

    // Validate input
    if (!username || !password || !email) {
      console.log("Registration failed: Missing required fields")
      return NextResponse.json({ error: "Username, password, and email are required" }, { status: 400 })
    }

    try {
      const supabase = createServerSupabaseClient()

      // Check if username exists
      console.log("Checking if username exists:", username)
      const { data: existingUsername, error: usernameError } = await supabase
        .from("users")
        .select("id")
        .ilike("username", username)
        .maybeSingle()

      if (usernameError) {
        console.error("Error checking username:", usernameError)
        return NextResponse.json(
          { error: "Database error when checking username", details: usernameError },
          { status: 500 },
        )
      }

      if (existingUsername) {
        console.log(`Username '${username}' already exists`)
        return NextResponse.json({ error: "Username already exists" }, { status: 409 })
      }

      // Check if email exists
      console.log("Checking if email exists:", email)
      const { data: existingEmail, error: emailError } = await supabase
        .from("users")
        .select("id")
        .ilike("email", email)
        .maybeSingle()

      if (emailError) {
        console.error("Error checking email:", emailError)
        return NextResponse.json({ error: "Database error when checking email", details: emailError }, { status: 500 })
      }

      if (existingEmail) {
        console.log(`Email '${email}' already exists`)
        return NextResponse.json({ error: "Email already exists" }, { status: 409 })
      }

      // Create user directly
      const userId = uuidv4()
      console.log("Creating user with ID:", userId)

      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: userId,
          username,
          password, // Store password as plain text for testing
          email,
          created_at: new Date().toISOString(),
        })
        .select()

      if (insertError) {
        console.error("Error inserting user:", insertError)
        return NextResponse.json({ error: "Failed to create user", details: insertError.message }, { status: 500 })
      }

      console.log("User created successfully:", newUser)
      return NextResponse.json({ success: true, user: { id: userId, username, email } }, { status: 201 })
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
