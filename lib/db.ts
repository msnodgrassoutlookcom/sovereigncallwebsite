import { createServerSupabaseClient } from "./supabase"
import type { User, SavedCharacter } from "./types"
import { v4 as uuidv4 } from "uuid"

// Get all users (admin function)
export async function getUsers(): Promise<User[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("users").select("*, characters(*)")

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data.map((user) => ({
    id: user.id,
    username: user.username,
    password: user.password,
    email: user.email,
    createdAt: user.created_at,
    resetToken: user.resetToken,
    resetTokenExpiry: user.resetTokenExpiry,
    profilePictureUrl: user.profile_picture_url,
    emailVerified: user.email_verified,
    verificationToken: user.verification_token,
    verificationTokenExpiry: user.verification_token_expiry,
    notificationPreferences: user.notification_preferences as User["notificationPreferences"],
    characters: user.characters.map((char) => ({
      id: char.id,
      name: char.name,
      faction: char.faction as "dominion" | "reformation" | null,
      gender: char.gender as "male" | "female" | null,
      combatClass: char.combat_class,
      storyClass: char.story_class,
      createdAt: char.created_at,
      portraitUrl: char.portrait_url,
    })),
  }))
}

// Get user by username - case insensitive
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient()

    // Use ilike for case-insensitive matching
    const { data, error } = await supabase
      .from("users")
      .select("*, characters(*)")
      .ilike("username", username)
      .maybeSingle()

    if (error) {
      console.error("Error getting user by username:", error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      email: data.email,
      createdAt: data.created_at,
      resetToken: data.reset_token,
      resetTokenExpiry: data.reset_token_expiry,
      profilePictureUrl: data.profile_picture_url,
      emailVerified: data.email_verified,
      verificationToken: data.verification_token,
      verificationTokenExpiry: data.verification_token_expiry,
      notificationPreferences: data.notification_preferences as User["notificationPreferences"],
      characters: data.characters
        ? data.characters.map((char) => ({
            id: char.id,
            name: char.name,
            faction: char.faction as "dominion" | "reformation" | null,
            gender: char.gender as "male" | "female" | null,
            combatClass: char.combat_class,
            storyClass: char.story_class,
            createdAt: char.created_at,
            portraitUrl: char.portrait_url,
          }))
        : [],
    }
  } catch (error) {
    console.error("Error in getUserByUsername:", error)
    return null
  }
}

// Get user by email - case insensitive
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const supabase = createServerSupabaseClient()

    // Use ilike for case-insensitive matching
    const { data, error } = await supabase.from("users").select("*, characters(*)").ilike("email", email).maybeSingle()

    if (error) {
      console.error("Error getting user by email:", error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      email: data.email,
      createdAt: data.created_at,
      resetToken: data.reset_token,
      resetTokenExpiry: data.reset_token_expiry,
      profilePictureUrl: data.profile_picture_url,
      emailVerified: data.email_verified,
      verificationToken: data.verification_token,
      verificationTokenExpiry: data.verification_token_expiry,
      notificationPreferences: data.notification_preferences as User["notificationPreferences"],
      characters: data.characters
        ? data.characters.map((char) => ({
            id: char.id,
            name: char.name,
            faction: char.faction as "dominion" | "reformation" | null,
            gender: char.gender as "male" | "female" | null,
            combatClass: char.combat_class,
            storyClass: char.story_class,
            createdAt: char.created_at,
            portraitUrl: char.portrait_url,
          }))
        : [],
    }
  } catch (error) {
    console.error("Error in getUserByEmail:", error)
    return null
  }
}

// Get user by reset token
export async function getUserByResetToken(token: string): Promise<User | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("users").select("*, characters(*)").eq("reset_token", token).single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    email: data.email,
    createdAt: data.created_at,
    resetToken: data.reset_token,
    resetTokenExpiry: data.reset_token_expiry,
    profilePictureUrl: data.profile_picture_url,
    emailVerified: data.email_verified,
    verificationToken: data.verification_token,
    verificationTokenExpiry: data.verification_token_expiry,
    notificationPreferences: data.notification_preferences as User["notificationPreferences"],
    characters: data.characters.map((char) => ({
      id: char.id,
      name: char.name,
      faction: char.faction as "dominion" | "reformation" | null,
      gender: char.gender as "male" | "female" | null,
      combatClass: char.combat_class,
      storyClass: char.story_class,
      createdAt: char.created_at,
      portraitUrl: char.portrait_url,
    })),
  }
}

// Get user by verification token
export async function getUserByVerificationToken(token: string): Promise<User | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("users")
    .select("*, characters(*)")
    .eq("verification_token", token)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    username: data.username,
    password: data.password,
    email: data.email,
    createdAt: data.created_at,
    resetToken: data.reset_token,
    resetTokenExpiry: data.reset_token_expiry,
    profilePictureUrl: data.profile_picture_url,
    emailVerified: data.email_verified,
    verificationToken: data.verification_token,
    verificationTokenExpiry: data.verification_token_expiry,
    notificationPreferences: data.notification_preferences as User["notificationPreferences"],
    characters: data.characters.map((char) => ({
      id: char.id,
      name: char.name,
      faction: char.faction as "dominion" | "reformation" | null,
      gender: char.gender as "male" | "female" | null,
      combatClass: char.combat_class,
      storyClass: char.story_class,
      createdAt: char.created_at,
      portraitUrl: char.portrait_url,
    })),
  }
}

// Create a new user
export async function createUser(username: string, password: string, email: string): Promise<User | null> {
  try {
    console.log("Creating user in database:", { username, email })
    const supabase = createServerSupabaseClient()

    const userId = uuidv4()
    const verificationToken = uuidv4()

    // Set verification token expiry to 24 hours from now
    const verificationTokenExpiry = new Date()
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24)

    // Create the user object
    const userObject = {
      id: userId,
      username,
      password,
      email,
      email_verified: false,
      verification_token: verificationToken,
      verification_token_expiry: verificationTokenExpiry.toISOString(),
      notification_preferences: {
        email_verification: true,
        password_reset: true,
        welcome: true,
        character_creation: true,
        forum_replies: true,
        forum_mentions: true,
        forum_reactions: true,
      },
    }

    console.log("User object prepared:", { ...userObject, password: "[REDACTED]" })

    // Insert the user
    const { data, error } = await supabase.from("users").insert(userObject).select()

    if (error) {
      console.error("Error inserting user:", error)
      return null
    }

    if (!data || data.length === 0) {
      console.error("No data returned after user insertion")
      return null
    }

    console.log("User inserted successfully:", { id: data[0].id, username: data[0].username })

    return {
      id: data[0].id,
      username: data[0].username,
      password: data[0].password,
      email: data[0].email,
      createdAt: data[0].created_at,
      resetToken: data[0].reset_token,
      resetTokenExpiry: data[0].reset_token_expiry,
      profilePictureUrl: data[0].profile_picture_url,
      emailVerified: data[0].email_verified,
      verificationToken: data[0].verification_token,
      verificationTokenExpiry: data[0].verification_token_expiry,
      notificationPreferences: data[0].notification_preferences as User["notificationPreferences"],
      characters: [],
    }
  } catch (error) {
    console.error("Error in createUser:", error)
    return null
  }
}

// Update user reset token
export async function updateUserResetToken(
  userId: string,
  resetToken: string | null,
  resetTokenExpiry: string | null,
): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("users")
    .update({
      reset_token: resetToken,
      reset_token_expiry: resetTokenExpiry,
    })
    .eq("id", userId)

  return !error
}

// Update user verification status
export async function verifyUserEmail(userId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("users")
    .update({
      email_verified: true,
      verification_token: null,
      verification_token_expiry: null,
    })
    .eq("id", userId)

  return !error
}

// Update user notification preferences
export async function updateNotificationPreferences(
  userId: string,
  preferences: User["notificationPreferences"],
): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("users")
    .update({
      notification_preferences: preferences,
    })
    .eq("id", userId)

  return !error
}

// Update user password
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("users")
    .update({
      password: newPassword,
      reset_token: null,
      reset_token_expiry: null,
    })
    .eq("id", userId)

  return !error
}

// Update user profile picture
export async function updateUserProfilePicture(userId: string, profilePictureUrl: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("users")
    .update({
      profile_picture_url: profilePictureUrl,
    })
    .eq("id", userId)

  return !error
}

// Save character
export async function saveCharacter(
  userId: string,
  character: Omit<SavedCharacter, "id" | "createdAt">,
): Promise<SavedCharacter | null> {
  const supabase = createServerSupabaseClient()

  // Check if character with same name exists
  const { data: existingChar } = await supabase
    .from("characters")
    .select("id")
    .eq("user_id", userId)
    .eq("name", character.name)
    .single()

  if (existingChar) {
    // Update existing character
    const { data, error } = await supabase
      .from("characters")
      .update({
        faction: character.faction,
        gender: character.gender,
        combat_class: character.combatClass,
        story_class: character.storyClass,
        portrait_url: character.portraitUrl,
      })
      .eq("id", existingChar.id)
      .select()
      .single()

    if (error || !data) {
      console.error("Error updating character:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      faction: data.faction as "dominion" | "reformation" | null,
      gender: data.gender as "male" | "female" | null,
      combatClass: data.combat_class,
      storyClass: data.story_class,
      createdAt: data.created_at,
      portraitUrl: data.portrait_url,
    }
  } else {
    // Create new character
    const characterId = uuidv4()

    const { data, error } = await supabase
      .from("characters")
      .insert({
        id: characterId,
        user_id: userId,
        name: character.name,
        faction: character.faction,
        gender: character.gender,
        combat_class: character.combatClass,
        story_class: character.storyClass,
        portrait_url: character.portraitUrl,
      })
      .select()
      .single()

    if (error || !data) {
      console.error("Error creating character:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      faction: data.faction as "dominion" | "reformation" | null,
      gender: data.gender as "male" | "female" | null,
      combatClass: data.combat_class,
      storyClass: data.story_class,
      createdAt: data.created_at,
      portraitUrl: data.portrait_url,
    }
  }
}

// Delete character
export async function deleteCharacter(userId: string, characterId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("characters").delete().eq("id", characterId).eq("user_id", userId)

  return !error
}

// Get character count for user
export async function getCharacterCount(userId: string): Promise<number> {
  const supabase = createServerSupabaseClient()

  const { count, error } = await supabase
    .from("characters")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (error) {
    console.error("Error counting characters:", error)
    return 0
  }

  return count || 0
}
