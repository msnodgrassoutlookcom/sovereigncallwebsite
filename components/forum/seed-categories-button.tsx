"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function SeedCategoriesButton() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSeedCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/forum/seed-categories", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to seed categories")
      }

      toast({
        title: "Categories seeded successfully",
        description: "The forum categories have been created.",
      })
    } catch (error) {
      console.error("Error seeding categories:", error)
      toast({
        title: "Error",
        description: "Failed to seed categories. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeedCategories} disabled={isLoading}>
      {isLoading ? "Seeding..." : "Seed Categories"}
    </Button>
  )
}

export default SeedCategoriesButton
