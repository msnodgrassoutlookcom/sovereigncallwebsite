"use client"

import { useAuth } from "@/context/auth-context"
import { useEffect, useState } from "react"

// This hook mimics the useSession hook from next-auth but uses our custom AuthContext
export function useAuthSession() {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">(
    loading ? "loading" : user ? "authenticated" : "unauthenticated",
  )

  useEffect(() => {
    if (loading) {
      setStatus("loading")
    } else {
      setStatus(user ? "authenticated" : "unauthenticated")
    }
  }, [user, loading])

  return {
    data: user
      ? {
          user: {
            id: user.id,
            name: user.username || user.email,
            email: user.email,
            image: user.avatar_url,
          },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }
      : null,
    status,
    update: async () => {
      // This would be implemented if we needed to update the session
      return true
    },
  }
}

// For components that import useSession from next-auth/react
export { useAuthSession as useSession }
