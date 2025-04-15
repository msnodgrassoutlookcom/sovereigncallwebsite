"use client"

import { useEffect, useState } from "react"

export default function GalaxyFallback() {
  const [loadingDots, setLoadingDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots((dots) => (dots.length >= 3 ? "." : dots + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-lg border border-cyan-400/30 bg-black flex items-center justify-center">
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

      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-cyan-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-cyan-400 font-mono tracking-wider">INITIALIZING GALAXY MAP{loadingDots}</p>
        <p className="mt-2 text-cyan-200/70 text-sm">Calibrating holographic projector</p>
      </div>

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
