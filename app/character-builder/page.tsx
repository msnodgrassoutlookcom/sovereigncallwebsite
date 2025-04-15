"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Share2,
  Facebook,
  Twitter,
  Download,
  Crosshair,
  Shield,
  Ghost,
  Flame,
  Sword,
  Swords,
  Axe,
  Zap,
  Brain,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react"
import html2canvas from "html2canvas"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SelectionCard from "@/components/selection-card"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { generateCharacterName as generateNameUtil } from "@/lib/name-generator"

// Add this to the top of your character builder page
import { cache, CACHE_TIMES } from "@/lib/cache"
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs"

// Define character templates
const characterTemplates = [
  // Add your character templates here
  // Example:
  // { id: "template1", name: "Template 1", faction: "dominion", gender: "male", combatClass: "striker", storyClass: "blade" },
]

// Optimize character templates with Redis caching
async function getCharacterTemplates() {
  return cache(
    "character:templates",
    async () => {
      // Original templates array
      return characterTemplates
    },
    CACHE_TIMES.DAY, // Templates rarely change
    { tags: ["templates"] },
  )
}

// Cache user character data for faster subsequent loads
async function getUserCharacters(userId: string) {
  if (!userId) return []

  return cache(
    `user:${userId}:characters`,
    async () => {
      const supabase = createServerSupabaseClient()
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching user characters:", error)
        return []
      }

      return data || []
    },
    CACHE_TIMES.SHORT, // Short cache as characters might change often
    { tags: [`user:${userId}`, "characters"] },
  )
}

// Optimize name generation with Redis caching
export async function generateCharacterName(options: {
  faction: Faction | null
  gender: Gender | null
  combatClass: CombatClass | null
  storyClass: StoryClass | null
}) {
  // Create a cache key based on the combination of options
  const cacheKey = `character:name:${options.faction || "none"}:${options.gender || "none"}:${options.combatClass || "none"}:${options.storyClass || "none"}`

  return cache(
    cacheKey,
    async () => {
      // Original name generation logic
      const generatedName = generateNameUtil({
        faction: options.faction,
        gender: options.gender,
        combatClass: options.combatClass,
        storyClass: options.storyClass,
      })

      return generatedName
    },
    CACHE_TIMES.DAY, // Names don't change frequently
  )
}

// Define types for our character options
type Faction = "dominion" | "reformation" | null
type Gender = "male" | "female" | null
type CombatClass =
  | "striker"
  | "warden"
  | "veilrunner"
  | "arbiter"
  | "vanguard"
  | "seraph"
  | "bastion"
  | "revenant"
  | "neuralcaster"
  | null
type StoryClass = "blade" | "seer" | "merc" | "spy" | "guardian" | "keeper" | "sentinel" | "broker" | null

// Define the character state
interface Character {
  name: string
  faction: Faction
  gender: Gender
  combatClass: CombatClass
  storyClass: StoryClass
}

// Define the steps in our character creation process
type Step = "faction" | "gender" | "combatClass" | "storyClass" | "summary"

export default function CharacterBuilder() {
  // State for the current step and character
  const [step, setStep] = useState<Step>("faction")
  const [character, setCharacter] = useState<Character>({
    name: "",
    faction: null,
    gender: null,
    combatClass: null,
    storyClass: null,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

  // Get auth context and toast
  const { isLoggedIn, user, saveCharacter } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Ref for the character summary section (for sharing/downloading)
  const summaryRef = useRef<HTMLDivElement>(null)

  // Check if we're editing an existing character
  useEffect(() => {
    const editParam = searchParams.get("edit")
    if (editParam && isLoggedIn && user) {
      const characterToEdit = user.characters.find((c) => c.id === editParam)
      if (characterToEdit) {
        setCharacter({
          name: characterToEdit.name,
          faction: characterToEdit.faction,
          gender: characterToEdit.gender,
          combatClass: characterToEdit.combatClass as CombatClass,
          storyClass: characterToEdit.storyClass as StoryClass,
        })
        setIsEditing(true)
        setEditId(editParam)
        setStep("summary")
      }
    }
  }, [searchParams, isLoggedIn, user])

  // Helper function to update character state
  const updateCharacter = (field: keyof Character, value: any) => {
    setCharacter((prev) => ({ ...prev, [field]: value }))
  }

  // Helper function to go to the next step
  const nextStep = () => {
    if (step === "faction") setStep("gender")
    else if (step === "gender") setStep("combatClass")
    else if (step === "combatClass") setStep("storyClass")
    else if (step === "storyClass") setStep("summary")
  }

  // Helper function to go to the previous step
  const prevStep = () => {
    if (step === "gender") setStep("faction")
    else if (step === "combatClass") setStep("gender")
    else if (step === "storyClass") setStep("combatClass")
    else if (step === "summary") setStep("storyClass")
  }

  // Reset character and go back to first step
  const resetCharacter = () => {
    setCharacter({
      name: "",
      faction: null,
      gender: null,
      combatClass: null,
      storyClass: null,
    })
    setStep("faction")
    setIsEditing(false)
    setEditId(null)
  }

  // Generate a random name based on character attributes
  const generateName = () => {
    const generatedName = generateCharacterName({
      faction: character.faction,
      gender: character.gender,
      combatClass: character.combatClass,
      storyClass: character.storyClass,
    })

    if (generatedName) {
      updateCharacter("name", generatedName)
    } else {
      toast({
        title: "Cannot Generate Name",
        description: "Please complete your character selections first.",
        variant: "destructive",
      })
    }
  }

  // Check if the current step is complete
  const isStepComplete = () => {
    if (step === "faction") return character.faction !== null
    if (step === "gender") return character.gender !== null
    if (step === "combatClass") return character.combatClass !== null
    if (step === "storyClass") return character.storyClass !== null
    return true
  }

  // Save the character to the user's account
  const handleSaveCharacter = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to save your character.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (character.name.trim() === "") {
      toast({
        title: "Name Required",
        description: "Please give your character a name before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const success = await saveCharacter({
        name: character.name,
        faction: character.faction,
        gender: character.gender,
        combatClass: character.combatClass,
        storyClass: character.storyClass,
      })

      if (success) {
        toast({
          title: isEditing ? "Character Updated" : "Character Saved",
          description: `${character.name} has been ${isEditing ? "updated" : "saved"} to your account.`,
        })

        if (isEditing) {
          router.push("/account/characters")
        }
      } else {
        toast({
          title: "Save Failed",
          description: "You can only save a maximum of 2 characters. Please delete one first.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Combat class data
  const combatClasses = [
    {
      id: "striker",
      name: "Striker",
      description: "Precision incarnate. Eliminates high-value targets from afar.",
      type: "ranged",
      icon: <Crosshair className="h-full w-full" />,
    },
    {
      id: "warden",
      name: "Warden",
      description: "Experts in control and suppression, locking down terrain.",
      type: "ranged",
      icon: <Shield className="h-full w-full" />,
    },
    {
      id: "veilrunner",
      name: "Veilrunner",
      description: "Stealthy and fast, striking from the shadows.",
      type: "ranged",
      icon: <Ghost className="h-full w-full" />,
    },
    {
      id: "arbiter",
      name: "Arbiter",
      description: "Channels tech or power through specialized ranged weaponry.",
      type: "ranged",
      icon: <Flame className="h-full w-full" />,
    },
    {
      id: "vanguard",
      name: "Vanguard",
      description: "Disciplined, efficient, lethal with a single energy blade.",
      type: "melee",
      icon: <Sword className="h-full w-full" />,
    },
    {
      id: "seraph",
      name: "Seraph",
      description: "Whirling storms of energy with a double-sided blade.",
      type: "melee",
      icon: <Swords className="h-full w-full" />,
    },
    {
      id: "bastion",
      name: "Bastion",
      description: "Massive, deliberate, unstoppable with an energy greatsword.",
      type: "melee",
      icon: <Axe className="h-full w-full" />,
    },
    {
      id: "revenant",
      name: "Revenant",
      description: "Feral and fast with dual energy blades.",
      type: "melee",
      icon: <Zap className="h-full w-full" />,
    },
    {
      id: "neuralcaster",
      name: "Neuralcaster",
      description: "The mind is the weapon, manipulating light and energy.",
      type: "special",
      icon: <Brain className="h-full w-full" />,
    },
  ]

  // Story class data
  const storyClasses = [
    {
      id: "blade",
      name: "The Blade",
      description: "Dominion Warrior",
      faction: "dominion",
      role: "Warrior",
    },
    {
      id: "seer",
      name: "The Seer",
      description: "Dominion Mystic",
      faction: "dominion",
      role: "Mystic",
    },
    {
      id: "merc",
      name: "The Merc",
      description: "Independent Contractor",
      faction: "any",
      role: "Contractor",
    },
    {
      id: "spy",
      name: "The Spy",
      description: "Dominion Intelligence",
      faction: "dominion",
      role: "Intelligence Officer",
    },
    {
      id: "guardian",
      name: "The Guardian",
      description: "Reformation Warrior",
      faction: "reformation",
      role: "Warrior",
    },
    {
      id: "keeper",
      name: "The Keeper",
      description: "Reformation Techborn",
      faction: "reformation",
      role: "Techborn",
    },
    {
      id: "sentinel",
      name: "The Sentinel",
      description: "Reformation Trooper",
      faction: "reformation",
      role: "Trooper",
    },
    {
      id: "broker",
      name: "The Broker",
      description: "Independent Smuggler with Reformation ties",
      faction: "reformation",
      role: "Smuggler",
    },
  ]

  // Get the name of the selected combat class
  const getCombatClassName = () => {
    if (!character.combatClass) return ""
    return combatClasses.find((c) => c.id === character.combatClass)?.name || ""
  }

  // Get the icon of the selected combat class
  const getCombatClassIcon = () => {
    if (!character.combatClass) return null
    return combatClasses.find((c) => c.id === character.combatClass)?.icon || null
  }

  // Get the name of the selected story class
  const getStoryClassName = () => {
    if (!character.storyClass) return ""
    return storyClasses.find((c) => c.id === character.storyClass)?.name || ""
  }

  // Get the role of the selected story class
  const getStoryClassRole = () => {
    if (!character.storyClass) return ""
    return storyClasses.find((c) => c.id === character.storyClass)?.role || ""
  }

  // Get the color for the faction
  const getFactionColor = () => {
    if (character.faction === "dominion") return "text-amber-500"
    if (character.faction === "reformation") return "text-blue-400"
    return "text-primary"
  }

  // Get the border color for the faction
  const getFactionBorderColor = () => {
    if (character.faction === "dominion") return "border-amber-500"
    if (character.faction === "reformation") return "border-blue-400"
    return "border-primary"
  }

  // Get the background gradient for the faction
  const getFactionGradient = () => {
    if (character.faction === "dominion") return "from-amber-950 to-amber-900"
    if (character.faction === "reformation") return "from-gray-900 to-gray-800"
    return "from-gray-950 to-gray-900"
  }

  // Share character to social media
  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(`Check out my ${getCombatClassName()} ${getStoryClassName()} in Sovereign Call!`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`, "_blank")
  }

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(
      `I created a ${character.gender} ${character.faction === "dominion" ? "Dominion" : "Reformation"} ${getCombatClassName()} ${getStoryClassName()} in Sovereign Call! #SovereignCall`,
    )
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank")
  }

  // Download character summary as an image
  const downloadCharacterSummary = async () => {
    if (!summaryRef.current) return

    setIsGeneratingImage(true)

    try {
      // Create a clone of the summary element to modify for better image output
      const clone = summaryRef.current.cloneNode(true) as HTMLElement

      // Apply some styling to make the image look better
      clone.style.padding = "20px"
      clone.style.backgroundColor = "#1a1a1a"
      clone.style.borderRadius = "8px"
      clone.style.width = "400px"

      // Add a watermark/logo
      const watermark = document.createElement("div")
      watermark.style.textAlign = "center"
      watermark.style.marginTop = "20px"
      watermark.style.fontSize = "12px"
      watermark.style.color = "#666"
      watermark.innerText = "Sovereign Call Character"
      clone.appendChild(watermark)

      // Append to body temporarily but hide it
      clone.style.position = "absolute"
      clone.style.left = "-9999px"
      document.body.appendChild(clone)

      // Use html2canvas to create an image
      const canvas = await html2canvas(clone, {
        backgroundColor: "#1a1a1a",
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
      })

      // Remove the clone from the DOM
      document.body.removeChild(clone)

      // Convert canvas to a data URL
      const dataUrl = canvas.toDataURL("image/png")

      // Create a download link and trigger it
      const link = document.createElement("a")
      link.download = `${character.name || "character"}-sovereign-call.png`
      link.href = dataUrl
      link.click()

      toast({
        title: "Character Image Downloaded",
        description: "Your character summary has been saved as an image.",
      })
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: "Failed to generate character image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${getFactionGradient()}`}>
      <div className="container mx-auto py-8">
        <Link href={isEditing ? "/account/characters" : "/"}>
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> {isEditing ? "Back to Characters" : "Back to Home"}
          </Button>
        </Link>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">{isEditing ? "Edit Character" : "Character Builder"}</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            {isEditing
              ? "Update your character for the world of Sovereign Call"
              : "Create your character for the world of Sovereign Call"}
          </p>

          {isLoggedIn && !isEditing && (
            <p className="mt-2 text-sm text-muted-foreground">You can save up to 2 characters to your account</p>
          )}
        </div>

        {/* Progress Steps */}
        {!isEditing && (
          <div className="mb-8">
            <div className="flex justify-between">
              {["faction", "gender", "combatClass", "storyClass", "summary"].map((s, index) => (
                <div
                  key={s}
                  className={cn("flex flex-col items-center", step === s ? "text-primary" : "text-muted-foreground")}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2",
                      step === s
                        ? getFactionBorderColor()
                        : s === "faction" && character.faction
                          ? getFactionBorderColor()
                          : "border-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs uppercase">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 w-full bg-muted">
              <div
                className={cn("h-full bg-primary transition-all", getFactionColor())}
                style={{
                  width: `${
                    step === "faction"
                      ? "0%"
                      : step === "gender"
                        ? "25%"
                        : step === "combatClass"
                          ? "50%"
                          : step === "storyClass"
                            ? "75%"
                            : "100%"
                  }`,
                }}
              />
            </div>
          </div>
        )}

        <Card className="border-none bg-black/30 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Faction Selection */}
            {step === "faction" && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Choose Your Faction</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectionCard
                    title="The Dominion"
                    description="Traditionalists who believe in strict adherence to the King's established protocols."
                    selected={character.faction === "dominion"}
                    onClick={() => updateCharacter("faction", "dominion")}
                    color="border-amber-500"
                  />
                  <SelectionCard
                    title="The Reformation"
                    description="Progressives who interpret the King's silence as a call for change."
                    selected={character.faction === "reformation"}
                    onClick={() => updateCharacter("faction", "reformation")}
                    color="border-blue-400"
                  />
                </div>
              </div>
            )}

            {/* Gender Selection */}
            {step === "gender" && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Choose Your Gender</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <SelectionCard
                    title="Male"
                    selected={character.gender === "male"}
                    onClick={() => updateCharacter("gender", "male")}
                    color={getFactionBorderColor()}
                  />
                  <SelectionCard
                    title="Female"
                    selected={character.gender === "female"}
                    onClick={() => updateCharacter("gender", "female")}
                    color={getFactionBorderColor()}
                  />
                </div>
              </div>
            )}

            {/* Combat Class Selection */}
            {step === "combatClass" && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Choose Your Combat Class</h2>
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-semibold text-blue-400">Ranged Specialists</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {combatClasses
                      .filter((c) => c.type === "ranged")
                      .map((combatClass) => (
                        <SelectionCard
                          key={combatClass.id}
                          title={combatClass.name}
                          description={combatClass.description}
                          selected={character.combatClass === combatClass.id}
                          onClick={() => updateCharacter("combatClass", combatClass.id)}
                          color={getFactionBorderColor()}
                        />
                      ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-semibold text-amber-400">Melee Specialists</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {combatClasses
                      .filter((c) => c.type === "melee")
                      .map((combatClass) => (
                        <SelectionCard
                          key={combatClass.id}
                          title={combatClass.name}
                          description={combatClass.description}
                          selected={character.combatClass === combatClass.id}
                          onClick={() => updateCharacter("combatClass", combatClass.id)}
                          color={getFactionBorderColor()}
                        />
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-purple-400">Special Class</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {combatClasses
                      .filter((c) => c.type === "special")
                      .map((combatClass) => (
                        <SelectionCard
                          key={combatClass.id}
                          title={combatClass.name}
                          description={combatClass.description}
                          selected={character.combatClass === combatClass.id}
                          onClick={() => updateCharacter("combatClass", combatClass.id)}
                          color={getFactionBorderColor()}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Story Class Selection */}
            {step === "storyClass" && (
              <div>
                <h2 className="mb-4 text-2xl font-bold">Choose Your Story Class</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {storyClasses.map((storyClass) => (
                    <SelectionCard
                      key={storyClass.id}
                      title={storyClass.name}
                      description={storyClass.description}
                      selected={character.storyClass === storyClass.id}
                      onClick={() => updateCharacter("storyClass", storyClass.id)}
                      disabled={
                        storyClass.faction !== "any" &&
                        character.faction !== null &&
                        storyClass.faction !== character.faction
                      }
                      color={getFactionBorderColor()}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Character Summary */}
            {step === "summary" && (
              <div>
                <h2 className="mb-6 text-2xl font-bold">Your Character</h2>
                <div className="flex flex-col items-center">
                  <div ref={summaryRef} className="flex w-full max-w-md flex-col items-center rounded-lg border p-6">
                    <div
                      className={cn(
                        "mb-6 flex h-32 w-32 items-center justify-center rounded-full border-4",
                        getFactionBorderColor(),
                      )}
                    >
                      <div className="text-6xl">{getCombatClassIcon()}</div>
                    </div>

                    <div className="mb-4 text-center">
                      <div className="mb-2">
                        <Label htmlFor="character-name">Character Name</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="character-name"
                            value={character.name}
                            onChange={(e) => updateCharacter("name", e.target.value)}
                            className="text-center"
                            placeholder="Enter character name"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={generateName}
                            title="Generate random name"
                          >
                            <RefreshCw className="h-4 w-4" />
                            <span className="sr-only">Generate random name</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8 text-center">
                      <h3 className={cn("text-3xl font-bold", getFactionColor())}>
                        {getStoryClassName()} {getCombatClassName()}
                      </h3>
                      <p className="mt-2 text-xl">
                        {character.gender === "male" ? "Male" : "Female"}{" "}
                        {character.faction === "dominion" ? "Dominion" : "Reformation"} {getStoryClassRole()}
                      </p>
                    </div>

                    <div className="mb-4 grid w-full grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Faction</h4>
                        <p className={cn("text-lg font-medium", getFactionColor())}>
                          {character.faction === "dominion" ? "The Dominion" : "The Reformation"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Gender</h4>
                        <p className="text-lg font-medium">{character.gender === "male" ? "Male" : "Female"}</p>
                      </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Combat Class</h4>
                        <p className="text-lg font-medium">{getCombatClassName()}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-muted-foreground">Story Class</h4>
                        <p className="text-lg font-medium">{getStoryClassName()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <p className="mb-4 text-muted-foreground">
                      {isEditing
                        ? "Update your character or share it with others."
                        : "Your character is ready to enter the world of Sovereign Call. Save your character to your account or share it."}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {!isEditing && (
                        <Button variant="outline" onClick={resetCharacter}>
                          Create New Character
                        </Button>
                      )}

                      {/* Always show the save button, but disable it if not logged in */}
                      <Button
                        className="gap-2"
                        onClick={handleSaveCharacter}
                        disabled={isSaving || character.name.trim() === "" || !isLoggedIn}
                        title={!isLoggedIn ? "Please log in to save your character" : ""}
                      >
                        <Save className="h-4 w-4" />{" "}
                        {!isLoggedIn
                          ? "Login Required"
                          : isSaving
                            ? "Saving..."
                            : isEditing
                              ? "Update Character"
                              : "Save Character"}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="gap-2">
                            <Share2 className="h-4 w-4" /> Share Character
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={shareToFacebook}>
                            <Facebook className="mr-2 h-4 w-4" /> Share to Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareToTwitter}>
                            <Twitter className="mr-2 h-4 w-4" /> Share to Twitter
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={downloadCharacterSummary} disabled={isGeneratingImage}>
                            {isGeneratingImage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" /> Download Image
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step !== "summary" && !isEditing && (
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === "faction"}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={nextStep} disabled={!isStepComplete()}>
                  {step === "storyClass" ? (
                    <>
                      Complete <Check className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
