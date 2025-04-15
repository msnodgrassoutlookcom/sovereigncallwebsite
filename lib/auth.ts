import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import type { Database } from "./database.types"

// Create a Supabase client for server components
export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Function to get user from request - explicitly exported as named export
export async function getUserFromRequest(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting session:", error)
      return null
    }

    if (!session?.user) {
      // Try to get user from request headers if session is not available
      const authHeader = request.headers.get("authorization")
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7)
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          return data.user
        }
      }
      console.log("No user in session")
      return null
    }

    return session.user
  } catch (error) {
    console.error("Error in getUserFromRequest:", error)
    return null
  }
}

// Re-export getUserFromRequest to ensure it's available;

// Create a Supabase client for client components
export const createClient = () => {
  return createClientComponentClient<Database>()
}

// Function to get the current user
export const getCurrentUser = async () => {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user
}

// Default export for backward compatibility
export default {
  createServerClient,
  createClient,
  getCurrentUser,
  getUserFromRequest,
}
