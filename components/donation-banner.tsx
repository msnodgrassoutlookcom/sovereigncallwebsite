"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DonationBanner = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem("donationBannerDismissed")
    if (dismissed === "true") {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("donationBannerDismissed", "true")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="bg-secondary border-b border-secondary-foreground/20 text-secondary-foreground py-1.5 px-4 text-center text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">Sovereign Call is crowdfunded! Your support helps us achieve AAA quality.</span>
        <div className="flex items-center space-x-2">
          <Link href="https://patreon.com/sovereigncallofficial" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              Donate
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleDismiss}>
            <X className="h-3 w-3" aria-label="Dismiss" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DonationBanner
