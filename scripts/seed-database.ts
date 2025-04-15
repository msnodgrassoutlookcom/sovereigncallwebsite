import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// Supabase connection
const supabaseUrl = process.env.SUPABASE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample data
const sampleUsers = [
  {
    id: uuidv4(),
    username: "commander_lyra",
    password: "password123", // In a real app, this would be hashed
    email: "lyra@sovereigncall.com",
  },
  {
    id: uuidv4(),
    username: "archon_vex",
    password: "password123",
    email: "vex@sovereigncall.com",
  },
  {
    id: uuidv4(),
    username: "emperor_caelus",
    password: "password123",
    email: "caelus@sovereigncall.com",
  },
  {
    id: uuidv4(),
    username: "chancellor_aeryn",
    password: "password123",
    email: "aeryn@sovereigncall.com",
  },
  {
    id: uuidv4(),
    username: "tarrik_walcur",
    password: "password123",
    email: "tarrik@sovereigncall.com",
  },
]

// Character templates - we'll assign these to users
const characterTemplates = [
  {
    name: "Lyra Vos",
    faction: "reformation",
    gender: "female",
    combat_class: "Tactician",
    story_class: "Commander",
  },
  {
    name: "Archon Vex",
    faction: "dominion",
    gender: "male",
    combat_class: "Psion",
    story_class: "Admiral",
  },
  {
    name: "Caelus Virel",
    faction: "dominion",
    gender: "male",
    combat_class: "Sovereign",
    story_class: "Emperor",
  },
  {
    name: "Aeryn Vos",
    faction: "reformation",
    gender: "female",
    combat_class: "Diplomat",
    story_class: "Chancellor",
  },
  {
    name: "Tarrik Walcur",
    faction: "reformation",
    gender: "male",
    combat_class: "Infiltrator",
    story_class: "Operative",
  },
  {
    name: "Lyessa Caedryn",
    faction: "dominion",
    gender: "female",
    combat_class: "Sentinel",
    story_class: "Guardian",
  },
  {
    name: "Vex Auren",
    faction: "dominion",
    gender: "male",
    combat_class: "Void Walker",
    story_class: "Admiral",
  },
  {
    name: "The Silent King",
    faction: "dominion",
    gender: "male",
    combat_class: "Sovereign",
    story_class: "King",
  },
]

async function seedDatabase() {
  console.log("Starting database seeding...")

  try {
    // Insert users
    console.log("Inserting users...")
    const { data: insertedUsers, error: userError } = await supabase.from("users").insert(sampleUsers).select()

    if (userError) {
      throw userError
    }

    console.log(`Successfully inserted ${insertedUsers.length} users`)

    // Create characters for each user (max 2 per user)
    console.log("Creating characters for users...")
    const characters = []

    for (const user of insertedUsers) {
      // Assign 1-2 characters to each user
      const numCharacters = Math.floor(Math.random() * 2) + 1

      // Find character templates that match the username
      const matchingTemplates = characterTemplates.filter(
        (template) =>
          user.username.includes(template.name.toLowerCase().split(" ")[0].toLowerCase()) ||
          user.username.includes(template.name.toLowerCase().split(" ")[1]?.toLowerCase() || ""),
      )

      // Use matching templates first, then random ones if needed
      const userTemplates = [...matchingTemplates]
      while (userTemplates.length < numCharacters) {
        const randomIndex = Math.floor(Math.random() * characterTemplates.length)
        const randomTemplate = characterTemplates[randomIndex]
        if (!userTemplates.includes(randomTemplate)) {
          userTemplates.push(randomTemplate)
        }
      }

      // Create characters from templates
      for (let i = 0; i < numCharacters; i++) {
        if (i < userTemplates.length) {
          characters.push({
            id: uuidv4(),
            user_id: user.id,
            name: userTemplates[i].name,
            faction: userTemplates[i].faction,
            gender: userTemplates[i].gender,
            combat_class: userTemplates[i].combat_class,
            story_class: userTemplates[i].story_class,
          })
        }
      }
    }

    // Insert characters
    const { data: insertedCharacters, error: characterError } = await supabase
      .from("characters")
      .insert(characters)
      .select()

    if (characterError) {
      throw characterError
    }

    console.log(`Successfully inserted ${insertedCharacters.length} characters`)

    // Print summary of what was created
    console.log("\n--- Database Seeding Summary ---")
    console.log(`Users created: ${insertedUsers.length}`)
    console.log(`Characters created: ${insertedCharacters.length}`)

    // Print login information for testing
    console.log("\n--- Test Login Information ---")
    insertedUsers.forEach((user) => {
      console.log(`Username: ${user.username}, Password: password123, Email: ${user.email}`)
    })
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seeding function
seedDatabase()
