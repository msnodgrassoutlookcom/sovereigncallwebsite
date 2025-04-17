"use client"

import { useEffect } from "react"
import { initPerformanceMonitoring } from "@/lib/performance-metrics"

export default function ClientInit() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring()
  }, [])

  return null
}
