"use client"

import { cn } from "@/lib/utils"

interface SelectionCardProps {
  title: string
  description?: string
  selected: boolean
  onClick: () => void
  color?: string
  disabled?: boolean
}

export default function SelectionCard({
  title,
  description,
  selected,
  onClick,
  color = "border-primary",
  disabled = false,
}: SelectionCardProps) {
  return (
    <div
      className={cn(
        "cursor-pointer rounded-lg border-2 p-4 transition-all",
        selected ? `${color} bg-background/80` : "border-muted bg-background/40",
        disabled ? "cursor-not-allowed opacity-50" : "hover:border-muted-foreground",
      )}
      onClick={disabled ? undefined : onClick}
    >
      <h3 className={cn("font-bold", selected ? "text-primary" : "text-foreground")}>{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}
