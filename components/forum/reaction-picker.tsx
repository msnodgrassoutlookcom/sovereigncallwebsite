"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"

// Common emoji reactions for forums
const commonEmojis = [
  "👍",
  "👎",
  "😄",
  "🎉",
  "😕",
  "❤️",
  "🚀",
  "👀",
  "🤔",
  "👏",
  "🔥",
  "💯",
  "🙌",
  "🤩",
  "😎",
  "🧐",
  "😍",
  "🤯",
  "👨‍💻",
  "✅",
]

interface ReactionPickerProps {
  onSelect: (emoji: string) => void
  onClose: () => void
}

function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  return (
    <Card ref={pickerRef} className="absolute z-50 p-2 mt-2 grid grid-cols-5 gap-2 bg-background shadow-lg">
      {commonEmojis.map((emoji) => (
        <button key={emoji} className="p-2 hover:bg-accent rounded-md text-lg" onClick={() => onSelect(emoji)}>
          {emoji}
        </button>
      ))}
    </Card>
  )
}

// Add both named and default exports
export { ReactionPicker }
export default ReactionPicker
