"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import { ReactionPicker } from "./reaction-picker"

interface Reaction {
  id: string
  emoji: string
  count: number
  userHasReacted: boolean
}

interface ReactionDisplayProps {
  reactions: Reaction[]
  onReactionSelect: (emoji: string) => void
  className?: string
}

function ReactionDisplay({ reactions, onReactionSelect, className = "" }: ReactionDisplayProps) {
  const [showPicker, setShowPicker] = React.useState(false)

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {reactions.map((reaction) => (
        <Button
          key={reaction.id}
          variant={reaction.userHasReacted ? "secondary" : "outline"}
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => onReactionSelect(reaction.emoji)}
        >
          <span>{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
      <Button variant="outline" size="sm" className="h-8" onClick={() => setShowPicker(!showPicker)}>
        <Smile className="h-4 w-4" />
      </Button>
      {showPicker && (
        <ReactionPicker
          onSelect={(emoji) => {
            onReactionSelect(emoji)
            setShowPicker(false)
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}

// Add both named and default exports
export { ReactionDisplay }
export default ReactionDisplay
