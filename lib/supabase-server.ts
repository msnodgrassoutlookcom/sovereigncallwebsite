import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export async function getSession() {
  const supabase = createServerSupabaseClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserFromSession() {
  const session = await getSession()
  if (!session?.user?.id) {
    return null
  }

  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from("users").select("*").eq("id", session.user.id).single()
  return data
}
