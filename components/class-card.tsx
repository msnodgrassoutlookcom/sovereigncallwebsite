import type React from "react"
import { cn } from "@/lib/utils"

interface ClassCardProps {
  name: string
  tagline: string
  description: string
  highlights: string
  color: string
  icon?: React.ReactNode
  type: "ranged" | "melee" | "special"
}

export default function ClassCard({ name, tagline, description, highlights, color, icon, type }: ClassCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6",
        type === "ranged" ? "border-blue-500/30" : type === "melee" ? "border-amber-500/30" : "border-purple-500/30",
      )}
    >
      <div className="absolute inset-0 z-0 opacity-10">
        <div className={cn("absolute inset-0 bg-gradient-to-br", color)} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3
            className={cn(
              "text-2xl font-bold",
              type === "ranged" ? "text-blue-400" : type === "melee" ? "text-amber-400" : "text-purple-400",
            )}
          >
            {name}
          </h3>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="mt-1 italic text-muted-foreground">"{tagline}"</p>
        <p className="mt-4">{description}</p>
        <div className="mt-4">
          <p
            className={cn(
              "text-sm font-medium",
              type === "ranged" ? "text-blue-400" : type === "melee" ? "text-amber-400" : "text-purple-400",
            )}
          >
            Highlights:
          </p>
          <p className="text-sm text-muted-foreground">{highlights}</p>
        </div>
      </div>
    </div>
  )
}
