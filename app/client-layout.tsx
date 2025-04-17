"use client"

import type React from "react"
import { PerformanceMonitor } from "@/components/performance-monitor"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PerformanceMonitor />
      {children}
    </>
  )
}
