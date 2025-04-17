"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { User, SavedCharacter } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  register: (username: string, password: string, email: string) => Promise<{ success: boolean; error?: string }>
  loading: boolean
  saveCharacter: (character: Omit<SavedCharacter, "id" | "createdAt">) => Promise<boolean>
  deleteCharacter: (characterId: string) => Promise<boolean>
  refreshAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a session storage key
const SESSION_STORAGE_KEY = "sovereign_call_session_active"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Enhanced user loading with session verification
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        let parsedUser
        try {
          parsedUser = JSON.parse(storedUser)
        } catch (e) {
          console.error("Error parsing stored user data:", e)
          localStorage.removeItem("user")
          sessionStorage.removeItem(SESSION_STORAGE_KEY)
          return
        }

        // Set session storage flag to indicate active session
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true")

        // Verify session with backend
        const verifyResponse = await fetch("/api/auth/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: parsedUser.id }),
        }).catch(() => null)

        if (verifyResponse && verifyResponse.ok) {
          // Session is valid
          setUser(parsedUser)
          setIsLoggedIn(true)
          console.log("User session verified:", parsedUser.username)
        } else {
          // Session verification failed but we'll still use local data
          // This prevents unnecessary logouts during network issues
          console.warn("Session verification failed, using cached credentials")
          setUser(parsedUser)
          setIsLoggedIn(true)
        }
      } else {
        console.log("No user found in localStorage")
        sessionStorage.removeItem(SESSION_STORAGE_KEY)
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      // Clear potentially corrupted data
      localStorage.removeItem("user")
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load user on initial render
  useEffect(() => {
    loadUserData()

    // Add event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === SESSION_STORAGE_KEY) {
        loadUserData()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [loadUserData])

  // Add a function to refresh auth state
  const refreshAuth = async () => {
    try {
      if (!user) return false

      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        console.warn("Failed to refresh session")
        return false
      }

      // Update session storage to indicate active session
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true")
      return true
    } catch (error) {
      console.error("Error refreshing auth:", error)
      return false
    }
  }

  const login = async (username: string, password: string) => {
    try {
      console.log("Attempting login for:", username)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Login failed:", data.error)
        return { success: false, error: data.error || "Failed to log in" }
      }

      console.log("Login successful:", data.user.username)

      // Save user to state and localStorage
      setUser(data.user)
      setIsLoggedIn(true)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set session storage flag
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true")

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  const logout = () => {
    // Clear user from state and localStorage
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("user")
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    console.log("User logged out")

    // Redirect to home page
    router.push("/")
  }

  const register = async (username: string, password: string, email: string) => {
    try {
      console.log("Attempting registration for:", username)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Registration failed:", data.error)
        return { success: false, error: data.error || "Failed to register" }
      }

      console.log("Registration successful:", data.user.username)
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  // Add the saveCharacter function
  const saveCharacter = async (character: Omit<SavedCharacter, "id" | "createdAt">) => {
    if (!user) {
      console.error("Cannot save character: User not logged in")
      return false
    }

    try {
      console.log("Saving character:", character.name)
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          character,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Save character failed:", data.error)
        return false
      }

      console.log("Character saved successfully:", data.character.name)

      // Update the user in state and localStorage with the new character
      const updatedUser = {
        ...user,
        characters: [
          ...user.characters.filter((c) => c.name !== character.name), // Remove existing character with same name if any
          data.character, // Add the newly saved character
        ],
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      return true
    } catch (error) {
      console.error("Save character error:", error)
      return false
    }
  }

  const deleteCharacter = async (characterId: string) => {
    if (!user) return false

    try {
      const response = await fetch(`/api/characters/${characterId}?userId=${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete character")
      }

      // Update the user state by removing the deleted character
      const updatedUser = {
        ...user,
        characters: user.characters.filter((char) => char.id !== characterId),
      }

      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))

      return true
    } catch (error) {
      console.error("Error deleting character:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        logout,
        register,
        loading,
        saveCharacter,
        deleteCharacter,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
