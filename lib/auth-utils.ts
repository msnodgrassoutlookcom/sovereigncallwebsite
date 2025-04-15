import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { createServerSupabaseClient } from "./supabase"
import { generateSecureToken, hashString } from "./security"

// Number of rounds for bcrypt (higher is more secure but slower)
const BCRYPT_ROUNDS = 12

/**
 * Hash a password securely
 * @param password Plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Password verification error:", error)
    return false
  }
}

/**
 * Generate a secure password reset token
 * @param userId User ID
 * @param expiryHours Hours until token expires
 */
export async function generatePasswordResetToken(userId: string, expiryHours = 1): Promise<string> {
  const supabase = createServerSupabaseClient()
  const token = generateSecureToken()
  const tokenHash = hashString(token)

  // Set expiry time
  const resetTokenExpiry = new Date()
  resetTokenExpiry.setHours(resetTokenExpiry.getHours() + expiryHours)

  // Update user with reset token
  await supabase
    .from("users")
    .update({
      reset_token: tokenHash,
      reset_token_expiry: resetTokenExpiry.toISOString(),
    })
    .eq("id", userId)

  return token
}

/**
 * Verify a password reset token
 * @param userId User ID
 * @param token Reset token
 */
export async function verifyPasswordResetToken(userId: string, token: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  // Get user with reset token
  const { data: user, error } = await supabase
    .from("users")
    .select("reset_token, reset_token_expiry")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return false
  }

  // Check if token is expired
  if (!user.reset_token_expiry || new Date(user.reset_token_expiry) < new Date()) {
    return false
  }

  // Verify token hash
  const tokenHash = hashString(token)
  return tokenHash === user.reset_token
}

/**
 * Generate a secure email verification token
 * @param userId User ID
 * @param expiryHours Hours until token expires
 */
export async function generateEmailVerificationToken(userId: string, expiryHours = 24): Promise<string> {
  const supabase = createServerSupabaseClient()
  const token = generateSecureToken()
  const tokenHash = hashString(token)

  // Set expiry time
  const verificationTokenExpiry = new Date()
  verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + expiryHours)

  // Update user with verification token
  await supabase
    .from("users")
    .update({
      verification_token: tokenHash,
      verification_token_expiry: verificationTokenExpiry.toISOString(),
    })
    .eq("id", userId)

  return token
}

/**
 * Verify an email verification token
 * @param userId User ID
 * @param token Verification token
 */
export async function verifyEmailVerificationToken(userId: string, token: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  // Get user with verification token
  const { data: user, error } = await supabase
    .from("users")
    .select("verification_token, verification_token_expiry")
    .eq("id", userId)
    .single()

  if (error || !user) {
    return false
  }

  // Check if token is expired
  if (!user.verification_token_expiry || new Date(user.verification_token_expiry) < new Date()) {
    return false
  }

  // Verify token hash
  const tokenHash = hashString(token)
  return tokenHash === user.verification_token
}

/**
 * Create a secure session token
 * @param userId User ID
 * @param expiryDays Days until token expires
 */
export async function createSessionToken(userId: string, expiryDays = 7): Promise<string> {
  const token = generateSecureToken()
  const tokenHash = hashString(token)
  const supabase = createServerSupabaseClient()

  // Set expiry time
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + expiryDays)

  // Store session in database
  await supabase.from("user_sessions").insert({
    id: uuidv4(),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiryDate.toISOString(),
    created_at: new Date().toISOString(),
  })

  return token
}

/**
 * Verify a session token
 * @param userId User ID
 * @param token Session token
 */
export async function verifySessionToken(userId: string, token: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  const tokenHash = hashString(token)

  // Get session with token hash
  const { data, error } = await supabase
    .from("user_sessions")
    .select("expires_at")
    .eq("user_id", userId)
    .eq("token_hash", tokenHash)
    .single()

  if (error || !data) {
    return false
  }

  // Check if session is expired
  return new Date(data.expires_at) > new Date()
}

/**
 * Invalidate all sessions for a user
 * @param userId User ID
 */
export async function invalidateAllSessions(userId: string): Promise<void> {
  const supabase = createServerSupabaseClient()

  await supabase.from("user_sessions").delete().eq("user_id", userId)
}
