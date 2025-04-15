// Name generator based on character attributes
type Faction = "dominion" | "reformation" | null
type Gender = "male" | "female" | null
type CombatClass = string | null
type StoryClass = string | null

interface NameGeneratorOptions {
  faction: Faction
  gender: Gender
  combatClass: CombatClass
  storyClass: StoryClass
}

// First names by faction and gender
const dominionFirstNames = {
  male: ["Vex", "Caelus", "Tarrik", "Maxim", "Darius", "Valerian", "Cassius", "Lucius", "Octavian", "Marcus"],
  female: ["Lyra", "Aurelia", "Valeria", "Livia", "Cassia", "Octavia", "Julia", "Claudia", "Flavia", "Lucilla"],
}

const reformationFirstNames = {
  male: ["Aeryn", "Zephyr", "Theron", "Cyrus", "Elian", "Nyx", "Orion", "Silas", "Talon", "Valen"],
  female: ["Lyessa", "Seraphina", "Nova", "Aria", "Cora", "Elara", "Freya", "Iris", "Thea", "Vega"],
}

// Last names by faction
const dominionLastNames = [
  "Virel",
  "Auren",
  "Walcur",
  "Draconis",
  "Valerius",
  "Tiberius",
  "Aurelius",
  "Severus",
  "Maximus",
  "Quintus",
  "Corvus",
  "Gallus",
  "Tacitus",
  "Varro",
  "Cato",
  "Nero",
  "Hadrian",
  "Trajan",
  "Antonius",
  "Brutus",
]

const reformationLastNames = [
  "Vos",
  "Caedryn",
  "Solaris",
  "Novus",
  "Stellaris",
  "Lumina",
  "Zephyrus",
  "Aetheria",
  "Thalassos",
  "Helios",
  "Selene",
  "Astra",
  "Orion",
  "Lyra",
  "Andromeda",
  "Cassiopeia",
  "Perseus",
  "Cepheus",
  "Aquila",
  "Phoenix",
]

// Story class titles
const storyTitles: Record<string, string> = {
  blade: "the Blade",
  seer: "the Seer",
  merc: "the Mercenary",
  spy: "the Spy",
  guardian: "the Guardian",
  keeper: "the Keeper",
  sentinel: "the Sentinel",
  broker: "the Broker",
}

export function generateCharacterName({ faction, gender, combatClass, storyClass }: NameGeneratorOptions): string {
  if (!faction || !gender) {
    return ""
  }

  // Get the appropriate first name list
  const firstNameList = faction === "dominion" ? dominionFirstNames : reformationFirstNames
  const genderList = gender === "male" ? firstNameList.male : firstNameList.female

  // Get a random first name
  const firstName = genderList[Math.floor(Math.random() * genderList.length)]

  // Get a random last name based on faction
  const lastNameList = faction === "dominion" ? dominionLastNames : reformationLastNames
  const lastName = lastNameList[Math.floor(Math.random() * lastNameList.length)]

  // Generate the name
  let name = `${firstName} ${lastName}`

  // Add story class title if available
  if (storyClass && storyTitles[storyClass]) {
    name += `, ${storyTitles[storyClass]}`
  }

  return name
}
