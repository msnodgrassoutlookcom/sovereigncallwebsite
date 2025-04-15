"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Reaction {
  emoji: string
  count: number
  reacted: boolean
}

interface PostReactionProps {
  initialReactions?: Reaction[]
}

const commonReactions = [
  { emoji: "👍", name: "thumbs up" },
  { emoji: "❤️", name: "heart" },
  { emoji: "🔥", name: "fire" },
  { emoji: "😄", name: "smile" },
  { emoji: "🤔", name: "thinking" },
  { emoji: "👀", name: "eyes" },
  { emoji: "🚀", name: "rocket" },
  { emoji: "💯", name: "hundred" },
]

export function PostReaction({ initialReactions = [] }: PostReactionProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions)

  const handleReaction = (emoji: string) => {
    setReactions((current) => {
      const existingIndex = current.findIndex((r) => r.emoji === emoji)

      if (existingIndex >= 0) {
        // Toggle reaction
        const updated = [...current]
        const existing = updated[existingIndex]

        if (existing.reacted) {
          // Remove reaction
          if (existing.count <= 1) {
            return updated.filter((r) => r.emoji !== emoji)
          } else {
            updated[existingIndex] = {
              ...existing,
              count: existing.count - 1,
              reacted: false,
            }
          }
        } else {
          // Add reaction
          updated[existingIndex] = {
            ...existing,
            count: existing.count + 1,
            reacted: true,
          }
        }

        return updated
      } else {
        // Add new reaction
        return [...current, { emoji, count: 1, reacted: true }]
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1 rounded-full px-2 text-xs", reaction.reacted && "bg-accent text-accent-foreground")}
          onClick={() => handleReaction(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 rounded-full px-2">
            <span className="text-xs">+</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="grid grid-cols-4 gap-2">
            {commonReactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  handleReaction(reaction.emoji)
                }}
              >
                <span className="text-lg">{reaction.emoji}</span>
                <span className="sr-only">{reaction.name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
