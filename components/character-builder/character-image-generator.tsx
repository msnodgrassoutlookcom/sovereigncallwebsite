"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface CharacterImageGeneratorProps {
  characterRef: React.RefObject<HTMLDivElement>
  characterName: string
}

export function CharacterImageGenerator({ characterRef, characterName }: CharacterImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const downloadCharacterSummary = async () => {
    if (!characterRef.current) return
    setIsGenerating(true)

    try {
      // Dynamically import html2canvas only when needed
      const html2canvasModule = await import("html2canvas")
      const html2canvas = html2canvasModule.default

      // Create a clone of the summary element to modify for better image output
      const clone = characterRef.current.cloneNode(true) as HTMLElement

      // Apply styling for better image output
      clone.style.padding = "20px"
      clone.style.backgroundColor = "#1a1a1a"
      clone.style.borderRadius = "8px"
      clone.style.width = "400px"

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
      link.download = `${characterName || "character"}-sovereign-call.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={downloadCharacterSummary} disabled={isGenerating} variant="outline" className="gap-2">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Image
        </>
      )}
    </Button>
  )
}
