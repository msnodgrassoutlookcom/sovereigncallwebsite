"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Users, AlertTriangle } from "lucide-react"
import { getFactionStats, type FactionStats } from "@/app/actions/get-faction-stats"

export function FactionStatistics() {
  const [stats, setStats] = useState<FactionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        const data = await getFactionStats()
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Failed to load faction stats:", err)
        setError("Failed to load faction statistics")
      } finally {
        setLoading(false)
      }
    }

    loadStats()

    // Refresh stats every 5 minutes
    const interval = setInterval(loadStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="w-full h-40 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 bg-primary rounded-full"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <p className="text-sm text-white/70">Loading faction statistics...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="w-full bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-red-400">
          <AlertTriangle className="h-8 w-8" />
          <p>Unable to load faction statistics</p>
        </div>
      </div>
    )
  }

  // Ensure percentages are at least 1% for visual display if there are any characters
  const minDisplayPercentage = 1
  let displayDominionPercentage = stats.dominion > 0 ? Math.max(stats.dominion_percentage, minDisplayPercentage) : 0
  let displayReformationPercentage =
    stats.reformation > 0 ? Math.max(stats.reformation_percentage, minDisplayPercentage) : 0

  // Adjust to ensure total doesn't exceed 100%
  if (displayDominionPercentage + displayReformationPercentage > 100) {
    const scale = 100 / (displayDominionPercentage + displayReformationPercentage)
    displayDominionPercentage *= scale
    displayReformationPercentage *= scale
  }

  return (
    <div className="w-full bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-center">Galactic Balance of Power</h2>

      <div className="space-y-8">
        {/* Faction bar visualization */}
        <div className="relative h-16 rounded-lg overflow-hidden border border-white/20">
          {/* Dominion side */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-700 to-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${displayDominionPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20"></div>
          </motion.div>

          {/* Reformation side */}
          <motion.div
            className="absolute top-0 right-0 h-full bg-gradient-to-l from-blue-700 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${displayReformationPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20"></div>
          </motion.div>

          {/* Center divider with conflict visualization */}
          <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center">
            <motion.div
              className="h-full w-1 bg-white/30 backdrop-blur-sm"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                boxShadow: [
                  "0 0 10px rgba(255,255,255,0.3)",
                  "0 0 20px rgba(255,255,255,0.6)",
                  "0 0 10px rgba(255,255,255,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            />
          </div>

          {/* Faction emblems */}
          <div className="absolute top-0 left-4 h-full flex items-center">
            <motion.div
              className="bg-black/40 p-1 rounded-full backdrop-blur-sm border border-amber-500/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Shield className="h-6 w-6 text-amber-400" />
            </motion.div>
          </div>

          <div className="absolute top-0 right-4 h-full flex items-center">
            <motion.div
              className="bg-black/40 p-1 rounded-full backdrop-blur-sm border border-blue-500/50"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Shield className="h-6 w-6 text-blue-400" />
            </motion.div>
          </div>
        </div>

        {/* Statistics display */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <h3 className="font-bold text-amber-400 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" /> Dominion
            </h3>
            <p className="text-2xl font-bold">{stats.dominion}</p>
            <p className="text-sm text-white/70">Characters</p>
            <p className="text-lg">{stats.dominion_percentage.toFixed(1)}%</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white/90 flex items-center justify-center gap-2">
              <Users className="h-4 w-4" /> Total
            </h3>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-white/70">Characters</p>
            <AnimatePresence mode="wait">
              <motion.div
                key={stats.total}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-6"
              >
                {stats.total > 0 ? (
                  <p className="text-xs text-white/50">Active conflict</p>
                ) : (
                  <p className="text-xs text-white/50">Awaiting data</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-blue-400 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" /> Reformation
            </h3>
            <p className="text-2xl font-bold">{stats.reformation}</p>
            <p className="text-sm text-white/70">Characters</p>
            <p className="text-lg">{stats.reformation_percentage.toFixed(1)}%</p>
          </div>
        </div>

        {/* Conflict status message */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${stats.dominion}-${stats.reformation}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-white/80 italic"
            >
              {getConflictMessage(stats)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate a message based on the current balance
function getConflictMessage(stats: FactionStats): string {
  const diff = Math.abs(stats.dominion_percentage - stats.reformation_percentage)

  if (stats.total === 0) {
    return "The galaxy awaits your allegiance. Which side will you choose?"
  }

  if (diff < 5) {
    return "The conflict is perfectly balanced. Both factions vie for supremacy."
  } else if (stats.dominion_percentage > stats.reformation_percentage) {
    if (diff > 30) {
      return "The Dominion exerts overwhelming control across the galaxy."
    } else if (diff > 15) {
      return "The Dominion holds a significant advantage in the ongoing conflict."
    } else {
      return "The Dominion maintains a slight edge over the Reformation forces."
    }
  } else {
    if (diff > 30) {
      return "The Reformation movement has gained overwhelming support across the galaxy."
    } else if (diff > 15) {
      return "The Reformation holds a significant advantage in the ongoing conflict."
    } else {
      return "The Reformation maintains a slight edge over the Dominion forces."
    }
  }
}
