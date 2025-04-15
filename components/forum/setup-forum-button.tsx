"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Database } from "lucide-react"

export function SetupForumButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const setupForum = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/forum/setup-tables")

      if (!response.ok) {
        throw new Error("Failed to set up forum tables")
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Forum setup complete",
          description: `Created: ${data.results.created.join(", ") || "none"}. Existing: ${data.results.existing.join(", ") || "none"}.`,
        })
      } else {
        toast({
          title: "Forum setup issues",
          description: `Errors occurred: ${data.results.errors.map((e) => e.table).join(", ")}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting up forum:", error)
      toast({
        title: "Error",
        description: "Failed to set up forum tables. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={setupForum} disabled={isLoading} className="flex items-center gap-2">
      <Database className="h-4 w-4" />
      {isLoading ? "Setting up..." : "Setup Forum Tables"}
    </Button>
  )
}
