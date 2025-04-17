"use client"

import { useEffect } from "react"
import { initPerformanceMonitoring } from "@/lib/performance-metrics"

export function PerformanceMonitor() {
  useEffect(() => {
    initPerformanceMonitoring()
  }, [])

  return null
}
