import { createClient } from "@supabase/supabase-js"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"
import type { CookieOptions } from "@supabase/auth-helpers-nextjs"
import type { NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file.")
}

export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

// Add a simple function to check if Supabase is connected
export async function checkSupabaseConnection() {
  try {
    // Use a simpler query that doesn't use aggregate functions
    const { data, error } = await supabase.from("forum_categories").select("id").limit(1)
    if (error) throw error
    return { connected: true, data }
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return { connected: false, error }
  }
}

// Create a singleton for client-side usage
let clientSideSupabase: ReturnType<typeof createClient<Database>> | null = null

export function getClientSupabase() {
  if (!clientSideSupabase) {
    clientSideSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return clientSideSupabase
}

// Server-side Supabase client with multiple signature options
// function _createServerSupabaseClient() {
//   const cookieStore = cookies()
//   return createServerComponentClient<Database>({ cookies: () => cookieStore })
// }

// // Alternative signature that might be expected
// function _createServerSupabaseClient(
//   cookieOptions?: { cookies: () => ReturnType<typeof cookies> }
// ) {
//   const cookieStore = cookieOptions?.cookies ? cookieOptions.cookies() : cookies()
//   return createServerComponentClient<Database>({ cookies: () => cookieStore })
// }

// // Another possible signature for API routes
// function _createServerSupabaseClient(
//   request?: NextRequest,
//   response?: Response,
//   cookieOptions?: CookieOptions
// ) {
//   const cookieStore = cookies()
//   return createServerComponentClient<Database>({ cookies: () => cookieStore })
// }

export function createServerSupabaseClient(
  requestOrCookieOptions?: NextRequest | { cookies: () => ReturnType<typeof cookies> } | undefined,
  response?: Response,
  cookieOptions?: CookieOptions,
) {
  let cookieStore

  if (requestOrCookieOptions instanceof Request) {
    cookieStore = cookies()
  } else if (
    requestOrCookieOptions &&
    typeof requestOrCookieOptions === "object" &&
    "cookies" in requestOrCookieOptions
  ) {
    cookieStore = requestOrCookieOptions.cookies()
  } else {
    cookieStore = cookies()
  }

  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
