"use client"

import { useEffect, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

import HighPerformanceGalaxy from "./galaxy-renderers/high-performance"
import MediumPerformanceGalaxy from "./galaxy-renderers/medium-performance"
import LowPerformanceGalaxy from "./galaxy-renderers/low-performance"
import StaticGalaxyImage from "./galaxy-renderers/static-image"

export default function OptimizedGalaxyCanvas() {
  const [mounted, setMounted] = useState(false)
  const isHighEnd = useMediaQuery("(min-width: 1024px)")
  const isMediumEnd = useMediaQuery("(min-width: 768px)")
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")

  // Detect device performance using navigator.deviceMemory and hardwareConcurrency
  const [devicePerformance, setDevicePerformance] = useState<"high" | "medium" | "low" | "minimal">("medium")

  useEffect(() => {
    setMounted(true)

    // Detect device capabilities
    const memory = (navigator as any).deviceMemory || 4
    const cores = navigator.hardwareConcurrency || 4

    if (memory >= 8 && cores >= 8) {
      setDevicePerformance("high")
    } else if (memory >= 4 && cores >= 4) {
      setDevicePerformance("medium")
    } else if (memory >= 2 && cores >= 2) {
      setDevicePerformance("low")
    } else {
      setDevicePerformance("minimal")
    }
  }, [])

  if (!mounted) return null

  // Respect user preferences for reduced motion
  if (prefersReducedMotion) {
    return <StaticGalaxyImage />
  }

  // Render appropriate version based on device capabilities
  if (devicePerformance === "high" && isHighEnd) {
    return <HighPerformanceGalaxy />
  } else if (devicePerformance === "medium" && isMediumEnd) {
    return <MediumPerformanceGalaxy />
  } else if (devicePerformance === "low") {
    return <LowPerformanceGalaxy />
  } else {
    return <StaticGalaxyImage />
  }
}
