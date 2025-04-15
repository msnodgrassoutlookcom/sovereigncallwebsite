// This file provides shims for next-auth imports to prevent errors
// when components try to import from next-auth/react

export function signIn() {
  // Redirect to login page
  window.location.href = "/login"
  return Promise.resolve()
}

export function signOut() {
  // Redirect to logout endpoint
  window.location.href = "/api/auth/logout"
  return Promise.resolve()
}

// Export the useSession hook from our custom hook
export { useSession } from "@/hooks/use-auth-session"
