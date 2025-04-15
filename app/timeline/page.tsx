"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Define the timeline events
const timelineEvents = [
  {
    id: 1,
    year: "0 A.K.",
    title: "The Eclipse Wars End",
    subtitle: "The Vanquishing",
    quote:
      "The King, wielding power unlike any seen before or since, drives back the ancient and insidious Eclipse race—beings of shadow and mind, who sought to unmake the cosmos itself.",
    details: [
      "The final battle is said to have split a star in half.",
      "The remnants of the Eclipse vanish into myth.",
      "The King establishes the Throneworld of Lyr, the center of a unified galactic order.",
    ],
    footer: "This moment marks Year 0 A.K. (After the King)—a new calendar begins.",
    color: "from-purple-900 to-indigo-900",
  },
  {
    id: 2,
    year: "0–400 A.K.",
    title: "The Age of Radiance",
    subtitle: "The Kingdom's Golden Era",
    quote:
      "Peace, prosperity, and shared purpose stretch across the stars. The King's words fuel energy grids. His emissaries bring healing. Planets align under a common banner.",
    details: [
      "Known as the Age of Radiance, this golden age is marked by technological marvels and cultural flourishing.",
      "The King's Guard is formed—elite defenders and judges who carry out his will.",
      "The Remnant Temple is built on Celaris, housing relics of the King's speech (used to power entire cities).",
      "No major wars are recorded during this time. Historians debate if this was divine order or fear cloaked as peace.",
    ],
    color: "from-amber-900 to-yellow-800",
  },
  {
    id: 3,
    year: "~420 A.K.",
    title: "The Day of Sundering",
    subtitle: "The King Falls Silent",
    quote: "Without warning, the King vanishes. No words. No signs. The stars dimmed that day.",
    details: [
      "Known as the Day of Sundering, this marks the end of direct divine rule.",
      "His silence creates panic. Power vacuums erupt.",
      "Without His presence, the world begins to fragment ideologically.",
      "Some believe He is testing them. Others claim He was never real.",
    ],
    color: "from-gray-900 to-slate-800",
  },
  {
    id: 4,
    year: "~450–600 A.K.",
    title: "Rise of the Dominion",
    subtitle: "",
    quote:
      "The King's Guard, leaderless but feared, reforms into a militaristic empire—the Dominion—claiming divine right to rule in His absence.",
    details: [
      "They seize the Throneworld of Lyr.",
      "A new emperor, Caelus Virel, declares himself Executor of the King's Will.",
      'Dominion doctrine rewrites history: "Obedience is Glory."',
      "The Remnant resists, but is forced into exile.",
      "Dominion banners rise across half the known galaxy.",
    ],
    color: "from-amber-950 to-amber-900",
  },
  {
    id: 5,
    year: "~600–740 A.K.",
    title: "The Reformation Secedes",
    subtitle: "",
    quote:
      "Disillusioned by what they've become, a faction of Dominion scientists, commanders, and thinkers reject imperial dogma.",
    details: [
      "They form the Reformation—a technocratic democracy built on logic, precision, and infrastructure.",
      "They accuse the Dominion of twisting the King's legacy into authoritarian control.",
      "The Reformation's founding documents denounce prophecy and divine rule entirely, instead elevating human achievement.",
    ],
    footer:
      "This era becomes known as the Fracturing Century—a cold war of ideology, sabotage, and slow militarization.",
    color: "from-blue-950 to-blue-900",
  },
  {
    id: 6,
    year: "~750 A.K.",
    title: "The Reach Wars Begin",
    subtitle: "",
    quote:
      'Tensions break. The Dominion launches a campaign to reclaim "traitor worlds." The Reformation responds with engineered force.',
    details: [
      "Entire systems burn. Espionage and orbital strikes become common.",
      "Small factions like the Remnant and scattered independents survive on the fringes, refusing to pick sides.",
      "The war sees massive loss of life and sparks a decade-long arms race.",
      "Rumors emerge of Eclipse ruins being unearthed, containing strange tech neither side can understand.",
    ],
    color: "from-red-950 to-red-900",
  },
  {
    id: 7,
    year: "~765 A.K.",
    title: "Fall of Euron",
    subtitle: "",
    quote:
      "The Dominion scorches the colony of Euron—a Reformation stronghold suspected of harboring Remnant sympathizers and an ancient power source.",
    details: [
      "This is where the vertical slice begins.",
      "The player, leads a strike team onto the ashes of a devastated city.",
      "But beneath the surface of this conquest, something older stirs—something long buried.",
    ],
    color: "from-orange-950 to-orange-900",
  },
]

export default function TimelinePage() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const currentEvent = timelineEvents[currentEventIndex]

  const goToPrevious = () => {
    if (currentEventIndex > 0 && !isAnimating) {
      setDirection("left")
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentEventIndex(currentEventIndex - 1)
        setTimeout(() => {
          setIsAnimating(false)
        }, 500)
      }, 300)
    }
  }

  const goToNext = () => {
    if (currentEventIndex < timelineEvents.length - 1 && !isAnimating) {
      setDirection("right")
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentEventIndex(currentEventIndex + 1)
        setTimeout(() => {
          setIsAnimating(false)
        }, 500)
      }, 300)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious()
      } else if (e.key === "ArrowRight") {
        goToNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentEventIndex, isAnimating])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Timeline of the Reach</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Explore the history of Sovereign Call, from the Eclipse Wars to the present day
          </p>
        </div>

        {/* Timeline Navigation */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-full max-w-3xl">
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 bg-gray-800"></div>
            <div className="relative flex justify-between">
              {timelineEvents.map((event, index) => (
                <button
                  key={event.id}
                  className={cn(
                    "relative z-10 h-4 w-4 rounded-full transition-all",
                    index <= currentEventIndex ? "bg-primary" : "bg-gray-600",
                    index === currentEventIndex && "h-6 w-6 ring-2 ring-primary ring-offset-2 ring-offset-gray-900",
                  )}
                  onClick={() => {
                    if (index < currentEventIndex) {
                      setDirection("left")
                    } else if (index > currentEventIndex) {
                      setDirection("right")
                    }
                    setCurrentEventIndex(index)
                  }}
                  aria-label={`Go to event: ${event.title}`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Year Display */}
        <div className="mb-4 text-center md:hidden">
          <div className="inline-block rounded-full border border-white/30 px-4 py-1 text-sm">{currentEvent.year}</div>
        </div>

        {/* Timeline Content */}
        <div className="relative mx-auto mb-8 h-[500px] max-w-4xl overflow-hidden rounded-lg border">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-opacity duration-500",
              currentEvent.color,
              isAnimating ? "opacity-0" : "opacity-100",
            )}
          ></div>

          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center p-4 md:p-8",
              isAnimating
                ? direction === "left"
                  ? "animate-slide-out-right"
                  : "animate-slide-out-left"
                : "animate-slide-in",
            )}
          >
            <div className="relative z-10 max-w-2xl text-center text-white">
              {/* Year is shown above on mobile, here on larger screens */}
              <div className="mb-2 hidden md:inline-block rounded-full border border-white/30 px-4 py-1 text-sm">
                {currentEvent.year}
              </div>
              <h2 className="mb-2 text-2xl font-bold md:text-4xl">{currentEvent.title}</h2>
              {currentEvent.subtitle && <h3 className="mb-4 text-lg md:text-xl italic">{currentEvent.subtitle}</h3>}
              <blockquote className="mb-6 border-l-4 border-white/30 pl-4 text-left italic">
                {currentEvent.quote}
              </blockquote>
              <ul className="mb-6 list-disc text-left">
                {currentEvent.details.map((detail, index) => (
                  <li key={index} className="mb-2">
                    {detail}
                  </li>
                ))}
              </ul>
              {currentEvent.footer && <p className="text-sm text-white/70">{currentEvent.footer}</p>}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            className={cn(
              "absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70",
              currentEventIndex === 0 ? "cursor-not-allowed opacity-50" : "opacity-100",
            )}
            onClick={goToPrevious}
            disabled={currentEventIndex === 0 || isAnimating}
            aria-label="Previous event"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className={cn(
              "absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70",
              currentEventIndex === timelineEvents.length - 1 ? "cursor-not-allowed opacity-50" : "opacity-100",
            )}
            onClick={goToNext}
            disabled={currentEventIndex === timelineEvents.length - 1 || isAnimating}
            aria-label="Next event"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Current Event Info */}
        <div className="mx-auto max-w-md text-center">
          <p className="text-lg font-medium">
            {currentEventIndex + 1} of {timelineEvents.length}: {currentEvent.title}
          </p>
          <p className="text-sm text-muted-foreground">
            Use arrow keys or the navigation buttons to explore the timeline
          </p>
        </div>
      </div>
    </div>
  )
}
