"use client"

import dynamic from "next/dynamic"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pause, Play, Info, Loader } from "lucide-react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

// Dynamically import the heavy component
const GalaxyCanvas = dynamic(() => import("@/components/galaxy-canvas"), {
  ssr: false, // Don't render on server
  loading: () => <GalaxyFallback />,
})

export default function GalaxyModel() {
  const [isRotating, setIsRotating] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-lg border border-cyan-400/30 bg-black">
      {/* Hologram projection effect */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
      <div className="absolute inset-x-0 top-0 h-[1px] bg-cyan-400/50"></div>
      <div className="absolute inset-y-0 left-0 w-[1px] bg-cyan-400/50"></div>
      <div className="absolute inset-y-0 right-0 w-[1px] bg-cyan-400/50"></div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/70"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/70"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/70"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/70"></div>

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Suspense fallback={<GalaxyFallback />}>
          <GalaxyCanvas isRotating={isRotating && !prefersReducedMotion} />
        </Suspense>
      </motion.div>

      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 backdrop-blur-sm border-cyan-400/30 hover:bg-cyan-900/20 text-cyan-400"
          onClick={() => setIsRotating(!isRotating)}
        >
          {isRotating ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {isRotating ? "Pause" : "Resume"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="bg-black/50 backdrop-blur-sm border-cyan-400/30 hover:bg-cyan-900/20 text-cyan-400"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-4 w-4 mr-1" />
          {showInfo ? "Hide Info" : "Galaxy Info"}
        </Button>
      </div>

      {showInfo && (
        <motion.div
          className="absolute top-4 left-4 max-w-xs bg-black/70 backdrop-blur-md p-4 rounded-lg border border-cyan-400/30"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h3 className="text-lg font-bold mb-2 text-cyan-400">The Reach</h3>
          <p className="text-sm text-cyan-200 mb-2">
            A vast expanse of stars spanning thousands of light years, home to the ongoing conflict between the Dominion
            and Reformation.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-cyan-100">
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
              <span>Dominion</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span>Reformation</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-1"></span>
              <span>Contested</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span>Neutral</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hologram projection base */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="w-3/4 h-1 bg-cyan-400/50 rounded-full"></div>
      </div>
      <div className="absolute inset-x-0 -bottom-4 flex justify-center">
        <div className="w-1/2 h-1 bg-cyan-400/30 rounded-full"></div>
      </div>
      <div className="absolute inset-x-0 -bottom-8 flex justify-center">
        <div className="w-1/3 h-1 bg-cyan-400/20 rounded-full"></div>
      </div>
    </div>
  )
}

function GalaxyFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <div className="text-center">
        <Loader className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
        <p className="mt-2 text-cyan-400">Loading galaxy map...</p>
      </div>
    </div>
  )
}
