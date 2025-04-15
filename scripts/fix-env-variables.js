// This script will help fix environment variable names in your .env file
const fs = require("fs")
const path = require("path")

// Path to your .env file
const envPath = path.join(process.cwd(), ".env")

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log("No .env file found. Creating a new one...")
  fs.writeFileSync(envPath, "")
}

// Read the current .env file
const envContent = fs.readFileSync(envPath, "utf8")
const envLines = envContent.split("\n")

// Define the correct variable names
const correctVariables = {
  // Supabase variables
  SUPABASE_SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL: "NEXT_PUBLIC_SUPABASE_URL",
  SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY_ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  SUPABASE_SUPABASE_URL: "SUPABASE_SUPABASE_URL",
  SUPABASE_SUPABASE_SERVICE_ROLE_KEY: "SUPABASE_SUPABASE_SERVICE_ROLE_KEY",
}

// Track which variables we've already seen
const seenVariables = {}
const newEnvLines = []

// Process existing lines
envLines.forEach((line) => {
  if (line.trim() === "" || line.startsWith("#")) {
    // Keep comments and empty lines
    newEnvLines.push(line)
    return
  }

  // Check if this is a variable definition
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    const [, key, value] = match
    const trimmedKey = key.trim()

    // Check if this is one of the variables we need to rename
    if (correctVariables[trimmedKey]) {
      const newKey = correctVariables[trimmedKey]
      console.log(`Renaming ${trimmedKey} to ${newKey}`)
      newEnvLines.push(`${newKey}=${value}`)
      seenVariables[newKey] = true
    } else {
      // Keep the original line
      newEnvLines.push(line)
      seenVariables[trimmedKey] = true
    }
  } else {
    // Not a variable definition, keep as is
    newEnvLines.push(line)
  }
})

// Add any missing variables with placeholder values
Object.entries(correctVariables).forEach(([oldKey, newKey]) => {
  if (!seenVariables[newKey] && !seenVariables[oldKey]) {
    console.log(`Adding placeholder for missing variable: ${newKey}`)
    newEnvLines.push(`${newKey}=YOUR_${newKey}_HERE`)
  }
})

// Write the updated content back to the .env file
fs.writeFileSync(envPath, newEnvLines.join("\n"))

console.log("Environment variables have been updated successfully!")
console.log("Please make sure to fill in any placeholder values in your .env file.")
