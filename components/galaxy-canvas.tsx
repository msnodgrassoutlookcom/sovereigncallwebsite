"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { planets } from "@/lib/planet-data"
import type { Planet } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface GalaxyCanvasProps {
  isRotating?: boolean
}

export default function GalaxyCanvas({ isRotating = true }: GalaxyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null)
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomTarget, setZoomTarget] = useState<{ x: number; y: number } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [time, setTime] = useState(0)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.width
    const y = (e.clientY - rect.top) / canvas.height

    // Check if clicked on a planet
    const clickedPlanet = planets.find((planet) => {
      const distance = Math.sqrt(Math.pow(planet.position.x - x, 2) + Math.pow(planet.position.y - y, 2))
      return distance < planet.size / 200 // Adjust hit area based on planet size
    })

    if (clickedPlanet) {
      setSelectedPlanet(clickedPlanet)
      setIsZoomed(true)
      setZoomTarget({ x: clickedPlanet.position.x, y: clickedPlanet.position.y })
      setZoomLevel(3)
    } else {
      // Reset zoom and clear selection if clicking elsewhere
      setIsZoomed(false)
      setZoomLevel(1)
      setZoomTarget(null)
      setSelectedPlanet(null)
    }
  }

  // Handle mouse move for hover effect
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / canvas.width
    const y = (e.clientY - rect.top) / canvas.height

    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })

    // Check if hovering over a planet
    const hovered = planets.find((planet) => {
      const distance = Math.sqrt(Math.pow(planet.position.x - x, 2) + Math.pow(planet.position.y - y, 2))
      return distance < planet.size / 200 // Adjust hit area based on planet size
    })

    setHoveredPlanet(hovered || null)

    // Change cursor style
    if (canvas) {
      canvas.style.cursor = hovered ? "pointer" : "default"
    }
  }

  // Hologram overlay effect
  useEffect(() => {
    const overlayCanvas = overlayCanvasRef.current
    if (!overlayCanvas) return

    const ctx = overlayCanvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = overlayCanvas.parentElement
      if (parent) {
        overlayCanvas.width = parent.clientWidth
        overlayCanvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation for hologram effects
    const renderOverlay = (timestamp: number) => {
      setTime(timestamp)
      ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

      // Draw hologram scan lines
      const scanLineCount = 100
      const scanLineHeight = overlayCanvas.height / scanLineCount

      ctx.globalAlpha = 0.07 + Math.sin(timestamp * 0.001) * 0.02

      for (let i = 0; i < scanLineCount; i++) {
        const y = i * scanLineHeight

        // Vary the opacity slightly for each line
        ctx.fillStyle = `rgba(32, 194, 214, ${0.05 + Math.random() * 0.05})`
        ctx.fillRect(0, y, overlayCanvas.width, scanLineHeight / 2)
      }

      // Draw flickering edge effect
      ctx.globalAlpha = 0.3 + Math.sin(timestamp * 0.002) * 0.1

      // Top and bottom edges
      const gradientTop = ctx.createLinearGradient(0, 0, 0, 20)
      gradientTop.addColorStop(0, "rgba(32, 194, 214, 0.7)")
      gradientTop.addColorStop(1, "rgba(32, 194, 214, 0)")

      ctx.fillStyle = gradientTop
      ctx.fillRect(0, 0, overlayCanvas.width, 2)

      const gradientBottom = ctx.createLinearGradient(0, overlayCanvas.height - 20, 0, overlayCanvas.height)
      gradientBottom.addColorStop(0, "rgba(32, 194, 214, 0)")
      gradientBottom.addColorStop(1, "rgba(32, 194, 214, 0.7)")

      ctx.fillStyle = gradientBottom
      ctx.fillRect(0, overlayCanvas.height - 2, overlayCanvas.width, 2)

      // Left and right edges
      const gradientLeft = ctx.createLinearGradient(0, 0, 20, 0)
      gradientLeft.addColorStop(0, "rgba(32, 194, 214, 0.7)")
      gradientLeft.addColorStop(1, "rgba(32, 194, 214, 0)")

      ctx.fillStyle = gradientLeft
      ctx.fillRect(0, 0, 2, overlayCanvas.height)

      const gradientRight = ctx.createLinearGradient(overlayCanvas.width - 20, 0, overlayCanvas.width, 0)
      gradientRight.addColorStop(0, "rgba(32, 194, 214, 0)")
      gradientRight.addColorStop(1, "rgba(32, 194, 214, 0.7)")

      ctx.fillStyle = gradientRight
      ctx.fillRect(overlayCanvas.width - 2, 0, 2, overlayCanvas.height)

      // Add corner accents
      const cornerSize = 20

      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(0, cornerSize)
      ctx.lineTo(0, 0)
      ctx.lineTo(cornerSize, 0)
      ctx.strokeStyle = "rgba(32, 194, 214, 0.8)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(overlayCanvas.width - cornerSize, 0)
      ctx.lineTo(overlayCanvas.width, 0)
      ctx.lineTo(overlayCanvas.width, cornerSize)
      ctx.stroke()

      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(0, overlayCanvas.height - cornerSize)
      ctx.lineTo(0, overlayCanvas.height)
      ctx.lineTo(cornerSize, overlayCanvas.height)
      ctx.stroke()

      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(overlayCanvas.width - cornerSize, overlayCanvas.height)
      ctx.lineTo(overlayCanvas.width, overlayCanvas.height)
      ctx.lineTo(overlayCanvas.width, overlayCanvas.height - cornerSize)
      ctx.stroke()

      // Add subtle glitch effect occasionally
      if (Math.random() < 0.01) {
        ctx.globalAlpha = 0.1
        const glitchHeight = Math.random() * overlayCanvas.height
        const glitchWidth = 20 + Math.random() * 100
        ctx.fillStyle = "rgba(32, 194, 214, 0.8)"
        ctx.fillRect(Math.random() * overlayCanvas.width, glitchHeight, glitchWidth, 2)
      }

      // Add hologram projection lines at the bottom
      ctx.globalAlpha = 0.15
      const projectionLines = 5
      const projectionSpacing = 15

      for (let i = 0; i < projectionLines; i++) {
        const y = overlayCanvas.height - 5 - i * projectionSpacing
        const width = overlayCanvas.width - i * 40

        ctx.beginPath()
        ctx.moveTo((overlayCanvas.width - width) / 2, y)
        ctx.lineTo((overlayCanvas.width - width) / 2 + width, y)
        ctx.strokeStyle = "rgba(32, 194, 214, 0.5)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      requestAnimationFrame(renderOverlay)
    }

    requestAnimationFrame(renderOverlay)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Main galaxy rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Star parameters
    const stars: {
      x: number
      y: number
      size: number
      color: string
      speed: number
      angle: number
      distance: number
      twinkle: number
      twinkleSpeed: number
    }[] = []

    // Nebula parameters
    const nebulae: {
      x: number
      y: number
      width: number
      height: number
      color: string
      opacity: number
    }[] = []

    // Energy fields
    const energyFields: {
      x: number
      y: number
      radius: number
      color: string
      pulseSpeed: number
      pulsePhase: number
    }[] = []

    // Dust particles
    const dustParticles: {
      x: number
      y: number
      size: number
      color: string
      speed: number
      angle: number
      distance: number
    }[] = []

    const numStars = 2000
    const numNebulae = 5
    const numEnergyFields = 3
    const numDustParticles = 100

    // Create stars in a spiral pattern
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.5

    // Create nebulae
    for (let i = 0; i < numNebulae; i++) {
      const x = centerX + (Math.random() - 0.5) * maxRadius * 1.5
      const y = centerY + (Math.random() - 0.5) * maxRadius * 1.5
      const width = maxRadius * (0.3 + Math.random() * 0.4)
      const height = maxRadius * (0.2 + Math.random() * 0.3)

      // Create different colored nebulae - using holographic blue/teal palette
      let color
      const colorType = Math.floor(Math.random() * 3)

      if (colorType === 0) {
        // Teal nebula
        color = `rgba(32, 194, 214, 0.1)`
      } else if (colorType === 1) {
        // Blue nebula
        color = `rgba(0, 145, 234, 0.1)`
      } else {
        // Cyan nebula
        color = `rgba(0, 229, 255, 0.1)`
      }

      nebulae.push({
        x,
        y,
        width,
        height,
        color,
        opacity: 0.05 + Math.random() * 0.1,
      })
    }

    // Create energy fields
    for (let i = 0; i < numEnergyFields; i++) {
      const distanceFromCenter = Math.random() * maxRadius * 0.7
      const angle = Math.random() * Math.PI * 2

      const x = centerX + Math.cos(angle) * distanceFromCenter
      const y = centerY + Math.sin(angle) * distanceFromCenter
      const radius = maxRadius * (0.05 + Math.random() * 0.15)

      // Create different colored energy fields - using holographic blue/teal palette
      let color
      const colorType = Math.floor(Math.random() * 3)

      if (colorType === 0) {
        // Teal energy
        color = "rgba(32, 194, 214, 0.2)"
      } else if (colorType === 1) {
        // Blue energy
        color = "rgba(0, 145, 234, 0.2)"
      } else {
        // Cyan energy
        color = "rgba(0, 229, 255, 0.2)"
      }

      energyFields.push({
        x,
        y,
        radius,
        color,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      })
    }

    // Create dust particles
    for (let i = 0; i < numDustParticles; i++) {
      const distanceFromCenter = Math.random() * maxRadius
      const angle = Math.random() * Math.PI * 2

      const x = centerX + Math.cos(angle) * distanceFromCenter
      const y = centerY + Math.sin(angle) * distanceFromCenter
      const size = 0.5 + Math.random() * 1

      // Dust colors - using holographic blue/teal palette
      const brightness = 150 + Math.random() * 105
      const color = `rgba(${brightness * 0.3}, ${brightness * 0.8}, ${brightness}, ${0.3 + Math.random() * 0.7})`

      dustParticles.push({
        x,
        y,
        size,
        color,
        speed: 0.0001 + Math.random() * 0.0005,
        angle: angle + Math.PI / 2, // Perpendicular to radius
        distance: distanceFromCenter,
      })
    }

    // Create spiral arms
    const numArms = 5
    for (let i = 0; i < numStars; i++) {
      // Choose a spiral arm
      const arm = Math.floor(Math.random() * numArms)

      // Create stars in a spiral pattern
      const distanceFromCenter = Math.random() * maxRadius
      const armOffset = (arm / numArms) * Math.PI * 2
      const spiralTightness = 4

      // Spiral equation
      const angle = armOffset + (distanceFromCenter / maxRadius) * spiralTightness

      // Add some randomness to the angle
      const randomAngle = angle + (Math.random() - 0.5) * 0.5

      const x = centerX + Math.cos(randomAngle) * distanceFromCenter
      const y = centerY + Math.sin(randomAngle) * distanceFromCenter

      // Stars get smaller toward the edges
      const size = Math.max(0.5, 2 * (1 - distanceFromCenter / maxRadius) + Math.random() * 0.5)

      // Create a color gradient using holographic blue/teal palette
      const colorValue = distanceFromCenter / maxRadius
      let color

      if (colorValue < 0.4) {
        // Teal/cyan stars (inner galaxy)
        color = `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(180 + Math.random() * 75)}, ${Math.floor(200 + Math.random() * 55)}, ${0.7 + Math.random() * 0.3})`
      } else {
        // Blue stars (outer galaxy)
        color = `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(100 + Math.random() * 155)}, ${Math.floor(200 + Math.random() * 55)}, ${0.5 + Math.random() * 0.5})`
      }

      // Rotation speed depends on distance from center (inner stars rotate faster)
      // Reduced speed for more subtle rotation
      const speed = 0.0002 + 0.0005 * (1 - distanceFromCenter / maxRadius)

      // Add twinkle effect
      const twinkle = Math.random()
      const twinkleSpeed = 0.01 + Math.random() * 0.03

      stars.push({
        x,
        y,
        size,
        color,
        speed,
        angle: randomAngle,
        distance: distanceFromCenter,
        twinkle,
        twinkleSpeed,
      })
    }

    // Add a bright center
    const drawGalaxyCore = (time: number) => {
      // Pulsating core
      const pulseSize = 1 + Math.sin(time * 0.001) * 0.1

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.2 * pulseSize)
      gradient.addColorStop(0, "rgba(32, 194, 214, 0.9)")
      gradient.addColorStop(0.1, "rgba(0, 229, 255, 0.7)")
      gradient.addColorStop(0.4, "rgba(0, 145, 234, 0.4)")
      gradient.addColorStop(1, "rgba(0, 145, 234, 0)")

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(centerX, centerY, maxRadius * 0.2 * pulseSize, 0, Math.PI * 2)
      ctx.fill()

      // Add core flare
      const flareGradient = ctx.createLinearGradient(
        centerX - maxRadius * 0.15,
        centerY,
        centerX + maxRadius * 0.15,
        centerY,
      )
      flareGradient.addColorStop(0, "rgba(32, 194, 214, 0)")
      flareGradient.addColorStop(0.5, `rgba(0, 229, 255, ${0.3 + Math.sin(time * 0.002) * 0.1})`)
      flareGradient.addColorStop(1, "rgba(32, 194, 214, 0)")

      ctx.beginPath()
      ctx.fillStyle = flareGradient
      ctx.arc(centerX, centerY, maxRadius * 0.15, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw nebulae
    const drawNebulae = () => {
      nebulae.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          Math.max(nebula.width, nebula.height) / 2,
        )

        gradient.addColorStop(0, nebula.color.replace("0.1", "0.3"))
        gradient.addColorStop(0.5, nebula.color)
        gradient.addColorStop(1, nebula.color.replace("0.1", "0"))

        ctx.beginPath()
        ctx.ellipse(
          nebula.x,
          nebula.y,
          nebula.width,
          nebula.height,
          Math.random() * Math.PI * 2, // rotation
          0,
          Math.PI * 2,
        )
        ctx.fillStyle = gradient
        ctx.fill()
      })
    }

    // Draw energy fields
    const drawEnergyFields = (time: number) => {
      energyFields.forEach((field) => {
        const pulseSize = 1 + Math.sin(time * field.pulseSpeed + field.pulsePhase) * 0.2

        const gradient = ctx.createRadialGradient(field.x, field.y, 0, field.x, field.y, field.radius * pulseSize)

        gradient.addColorStop(0, field.color.replace("0.2", "0.4"))
        gradient.addColorStop(0.7, field.color)
        gradient.addColorStop(1, field.color.replace("0.2", "0"))

        ctx.beginPath()
        ctx.arc(field.x, field.y, field.radius * pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })
    }

    // Draw dust particles
    const drawDustParticles = () => {
      dustParticles.forEach((particle) => {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })
    }

    // Generate a noise pattern for planet surfaces
    const generateNoisePattern = (size: number, roughness: number, baseColor: string) => {
      const offscreenCanvas = document.createElement("canvas")
      offscreenCanvas.width = size * 2
      offscreenCanvas.height = size * 2
      const offCtx = offscreenCanvas.getContext("2d")

      if (!offCtx) return null

      // Create base color
      offCtx.fillStyle = baseColor
      offCtx.fillRect(0, 0, size * 2, size * 2)

      // Add noise
      const imageData = offCtx.getImageData(0, 0, size * 2, size * 2)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * roughness
        data[i] = Math.min(255, Math.max(0, data[i] + noise * 50)) // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 50)) // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 50)) // B
      }

      offCtx.putImageData(imageData, 0, 0)

      return offscreenCanvas
    }

    // Draw planets
    const drawPlanets = (time: number) => {
      planets.forEach((planet) => {
        const x = planet.position.x * canvas.width
        const y = planet.position.y * canvas.height

        // Calculate size based on importance and zoom
        let size = planet.size
        if (planet.importance === "capital") size *= 1.5
        if (planet.importance === "minor") size *= 0.8

        // Adjust size based on zoom level
        if (isZoomed && zoomTarget) {
          const distanceToZoomTarget = Math.sqrt(
            Math.pow(planet.position.x - zoomTarget.x, 2) + Math.pow(planet.position.y - zoomTarget.y, 2),
          )

          // Make planets closer to zoom target appear larger
          if (distanceToZoomTarget < 0.2) {
            size *= 1 + (0.2 - distanceToZoomTarget) * 10
          }
        }

        // Draw planet glow
        const isHovered = hoveredPlanet?.id === planet.id
        const isSelected = selectedPlanet?.id === planet.id

        // Enhanced glow effect
        if (isHovered || isSelected) {
          const glowSize = size * (2 + Math.sin(time * 0.003) * 0.3)
          const gradient = ctx.createRadialGradient(x, y, size, x, y, glowSize)

          // Use holographic colors for glow
          gradient.addColorStop(0, `rgba(32, 194, 214, 0.5)`) // 50% opacity
          gradient.addColorStop(0.5, `rgba(32, 194, 214, 0.25)`) // 25% opacity
          gradient.addColorStop(1, `rgba(32, 194, 214, 0)`) // 0% opacity

          ctx.beginPath()
          ctx.arc(x, y, glowSize, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
        }

        // Determine planet type based on faction and id
        let planetType = "terrestrial"
        if (planet.id === "asteria") planetType = "gas"
        else if (planet.id === "cygnus") planetType = "ice"
        else if (planet.id === "shadow-reach") planetType = "volcanic"
        else if (planet.faction === "dominion") planetType = Math.random() > 0.5 ? "terrestrial" : "desert"
        else if (planet.faction === "reformation") planetType = Math.random() > 0.5 ? "oceanic" : "tech"
        else if (planet.faction === "contested") planetType = Math.random() > 0.5 ? "volcanic" : "barren"
        else planetType = "terrestrial"

        // Draw planetary rings for some planets
        if (planet.importance === "capital" || planet.id === "asteria" || Math.random() > 0.7) {
          // Draw rings behind the planet
          const ringWidth = size * 2.5
          const ringHeight = size * 0.5

          // Create ring gradient
          const ringGradient = ctx.createLinearGradient(x - ringWidth / 2, y, x + ringWidth / 2, y)

          // Different ring colors based on faction
          if (planet.faction === "dominion") {
            ringGradient.addColorStop(0, "rgba(255, 215, 0, 0)")
            ringGradient.addColorStop(0.2, "rgba(255, 215, 0, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(255, 215, 0, 0.2)")
            ringGradient.addColorStop(1, "rgba(255, 215, 0, 0)")
          } else if (planet.faction === "reformation") {
            ringGradient.addColorStop(0, "rgba(65, 105, 225, 0)")
            ringGradient.addColorStop(0.2, "rgba(65, 105, 225, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(65, 105, 225, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(65, 105, 225, 0.2)")
            ringGradient.addColorStop(1, "rgba(65, 105, 225, 0)")
          } else {
            ringGradient.addColorStop(0, "rgba(200, 200, 200, 0)")
            ringGradient.addColorStop(0.2, "rgba(200, 200, 200, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(200, 200, 200, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(200, 200, 200, 0.2)")
            ringGradient.addColorStop(1, "rgba(200, 200, 200, 0)")
          }

          // Save context for clipping
          ctx.save()

          // Create clipping region for the part of the rings behind the planet
          ctx.beginPath()
          ctx.ellipse(x, y, ringWidth / 2, ringHeight / 2, 0, 0, Math.PI * 2)
          ctx.clip()

          // Draw the rings that are behind the planet
          ctx.beginPath()
          ctx.ellipse(x, y, ringWidth / 2, ringHeight / 2, 0, 0, Math.PI * 2)
          ctx.fillStyle = ringGradient
          ctx.fill()

          // Restore context
          ctx.restore()
        }

        // Draw orbital structures for capital and major planets
        if ((planet.importance === "capital" || planet.importance === "major") && size > 6) {
          const orbitDistance = size * 1.3
          const structureCount = planet.importance === "capital" ? 3 : 1

          for (let i = 0; i < structureCount; i++) {
            const angle = (i / structureCount) * Math.PI * 2 + time * 0.0002
            const structX = x + Math.cos(angle) * orbitDistance
            const structY = y + Math.sin(angle) * orbitDistance
            const structSize = size * 0.15

            // Draw orbital station
            ctx.beginPath()
            ctx.arc(structX, structY, structSize, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(200, 200, 200, 0.8)"
            ctx.fill()

            // Draw energy connection to planet
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(structX, structY)
            ctx.strokeStyle = `rgba(32, 194, 214, ${0.3 + Math.sin(time * 0.005)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // Base planet color based on faction and type
        let baseColor
        if (planetType === "gas") {
          baseColor =
            planet.faction === "dominion"
              ? "rgba(255, 180, 100, 0.8)"
              : planet.faction === "reformation"
                ? "rgba(100, 150, 255, 0.8)"
                : "rgba(180, 130, 200, 0.8)"
        } else if (planetType === "ice") {
          baseColor = "rgba(200, 230, 255, 0.8)"
        } else if (planetType === "volcanic") {
          baseColor = "rgba(200, 50, 30, 0.8)"
        } else if (planetType === "desert") {
          baseColor = "rgba(230, 190, 130, 0.8)"
        } else if (planetType === "oceanic") {
          baseColor = "rgba(30, 100, 200, 0.8)"
        } else if (planetType === "tech") {
          baseColor = "rgba(100, 200, 200, 0.8)"
        } else if (planetType === "barren") {
          baseColor = "rgba(150, 150, 150, 0.8)"
        } else {
          // Default terrestrial
          baseColor = "rgba(100, 180, 100, 0.8)"
        }

        // Create noise pattern for planet surface
        const roughness = planetType === "gas" ? 0.2 : planetType === "ice" ? 0.1 : 0.4
        const noisePattern = generateNoisePattern(size, roughness, baseColor)

        // Draw planet with atmosphere effect
        ctx.save()
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.clip()

        // Draw base planet with noise pattern if available
        if (noisePattern) {
          ctx.drawImage(noisePattern, x - size, y - size, size * 2, size * 2)
        } else {
          ctx.fillStyle = baseColor
          ctx.fillRect(x - size, y - size, size * 2, size * 2)
        }

        // Add surface details based on planet type
        if (planetType === "gas") {
          // Gas giant bands
          const bandCount = 5 + Math.floor(Math.random() * 5)
          for (let i = 0; i < bandCount; i++) {
            const bandY = y - size + (size * 2 * i) / bandCount
            const bandHeight = ((size * 2) / bandCount) * 0.8

            ctx.fillStyle = `rgba(${Math.floor(200 + Math.random() * 55)}, ${Math.floor(150 + Math.random() * 105)}, ${Math.floor(100 + Math.random() * 155)}, 0.2)`
            ctx.fillRect(x - size, bandY, size * 2, bandHeight)
          }

          // Add swirling storm features
          const stormCount = 2 + Math.floor(Math.random() * 3)
          for (let i = 0; i < stormCount; i++) {
            const stormX = x - size * 0.5 + Math.random() * size
            const stormY = y - size * 0.7 + Math.random() * size * 1.4
            const stormSize = size * (0.1 + Math.random() * 0.2)

            const stormGradient = ctx.createRadialGradient(stormX, stormY, 0, stormX, stormY, stormSize)
            stormGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)")
            stormGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)")
            stormGradient.addColorStop(1, "rgba(255, 255, 255, 0)")

            ctx.beginPath()
            ctx.ellipse(stormX, stormY, stormSize, stormSize * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
            ctx.fillStyle = stormGradient
            ctx.fill()
          }
        } else if (planetType === "tech") {
          // Add tech grid lines
          const gridLines = 6 + Math.floor(Math.random() * 6)
          ctx.strokeStyle = "rgba(0, 255, 255, 0.5)"
          ctx.lineWidth = 0.5

          // Latitude lines
          for (let i = 1; i < gridLines; i++) {
            const lineY = y - size + (size * 2 * i) / gridLines
            ctx.beginPath()
            ctx.moveTo(x - size, lineY)
            ctx.lineTo(x + size, lineY)
            ctx.stroke()
          }

          // Longitude lines
          for (let i = 1; i < gridLines; i++) {
            const lineX = x - size + (size * 2 * i) / gridLines
            ctx.beginPath()
            ctx.moveTo(lineX, y - size)
            ctx.lineTo(lineX, y + size)
            ctx.stroke()
          }

          // Add city lights
          const cityCount = 5 + Math.floor(Math.random() * 10)
          for (let i = 0; i < cityCount; i++) {
            const cityX = x - size * 0.8 + Math.random() * size * 1.6
            const cityY = y - size * 0.8 + Math.random() * size * 1.6
            const citySize = size * (0.05 + Math.random() * 0.1)

            ctx.beginPath()
            ctx.arc(cityX, cityY, citySize, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(0, 255, 255, 0.8)"
            ctx.fill()

            // Add connecting lines between some cities
            if (i > 0 && Math.random() > 0.5) {
              const prevCityX = x - size * 0.8 + Math.random() * size * 1.6
              const prevCityY = y - size * 0.8 + Math.random() * size * 1.6

              ctx.beginPath()
              ctx.moveTo(cityX, cityY)
              ctx.lineTo(prevCityX, prevCityY)
              ctx.strokeStyle = "rgba(0, 255, 255, 0.4)"
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        } else if (planetType === "volcanic") {
          // Add lava flows
          const lavaCount = 3 + Math.floor(Math.random() * 5)
          for (let i = 0; i < lavaCount; i++) {
            const lavaX = x - size * 0.7 + Math.random() * size * 1.4
            const lavaY = y - size * 0.7 + Math.random() * size * 1.4
            const lavaSize = size * (0.1 + Math.random() * 0.3)

            const lavaGradient = ctx.createRadialGradient(lavaX, lavaY, 0, lavaX, lavaY, lavaSize)
            lavaGradient.addColorStop(0, "rgba(255, 200, 0, 0.9)")
            lavaGradient.addColorStop(0.5, "rgba(255, 100, 0, 0.7)")
            lavaGradient.addColorStop(1, "rgba(200, 0, 0, 0)")

            ctx.beginPath()
            ctx.arc(lavaX, lavaY, lavaSize, 0, Math.PI * 2)
            ctx.fillStyle = lavaGradient
            ctx.fill()
          }
        } else if (planetType === "oceanic") {
          // Add continent shapes
          const continentCount = 2 + Math.floor(Math.random() * 3)
          for (let i = 0; i < continentCount; i++) {
            const contX = x - size * 0.6 + Math.random() * size * 1.2
            const contY = y - size * 0.6 + Math.random() * size * 1.2
            const contSize = size * (0.2 + Math.random() * 0.3)

            ctx.beginPath()
            ctx.arc(contX, contY, contSize, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(150, 220, 150, 0.7)"
            ctx.fill()
          }

          // Add cloud patterns
          const cloudCount = 4 + Math.floor(Math.random() * 5)
          for (let i = 0; i < cloudCount; i++) {
            const cloudX = x - size * 0.8 + Math.random() * size * 1.6
            const cloudY = y - size * 0.8 + Math.random() * size * 1.6
            const cloudSize = size * (0.15 + Math.random() * 0.2)

            ctx.beginPath()
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2)
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
            ctx.fill()
          }
        }

        // Add a highlight for 3D effect
        ctx.beginPath()
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fill()

        ctx.restore()

        // Draw atmosphere glow
        const atmosphereGradient = ctx.createRadialGradient(x, y, size * 0.9, x, y, size * 1.2)

        // Different atmosphere colors based on planet type
        if (planetType === "gas") {
          atmosphereGradient.addColorStop(0, "rgba(255, 200, 100, 0.5)")
          atmosphereGradient.addColorStop(1, "rgba(255, 200, 100, 0)")
        } else if (planetType === "ice") {
          atmosphereGradient.addColorStop(0, "rgba(200, 230, 255, 0.5)")
          atmosphereGradient.addColorStop(1, "rgba(200, 230, 255, 0)")
        } else if (planetType === "volcanic") {
          atmosphereGradient.addColorStop(0, "rgba(255, 100, 50, 0.5)")
          atmosphereGradient.addColorStop(1, "rgba(255, 100, 50, 0)")
        } else if (planetType === "tech") {
          atmosphereGradient.addColorStop(0, "rgba(0, 200, 200, 0.5)")
          atmosphereGradient.addColorStop(1, "rgba(0, 200, 200, 0)")
        } else {
          // Default atmosphere
          atmosphereGradient.addColorStop(0, "rgba(100, 150, 255, 0.3)")
          atmosphereGradient.addColorStop(1, "rgba(100, 150, 255, 0)")
        }

        ctx.beginPath()
        ctx.arc(x, y, size * 1.2, 0, Math.PI * 2)
        ctx.fillStyle = atmosphereGradient
        ctx.fill()

        // Draw shield effect for capital worlds
        if (planet.importance === "capital") {
          const shieldPulse = 1 + Math.sin(time * 0.002) * 0.1
          const shieldGradient = ctx.createRadialGradient(x, y, size * 1.1, x, y, size * 1.3 * shieldPulse)

          if (planet.faction === "dominion") {
            shieldGradient.addColorStop(0, "rgba(255, 215, 0, 0.2)")
            shieldGradient.addColorStop(1, "rgba(255, 215, 0, 0)")
          } else if (planet.faction === "reformation") {
            shieldGradient.addColorStop(0, "rgba(65, 105, 225, 0.2)")
            shieldGradient.addColorStop(1, "rgba(65, 105, 225, 0)")
          } else {
            shieldGradient.addColorStop(0, "rgba(200, 200, 200, 0.2)")
            shieldGradient.addColorStop(1, "rgba(200, 200, 200, 0)")
          }

          ctx.beginPath()
          ctx.arc(x, y, size * 1.3 * shieldPulse, 0, Math.PI * 2)
          ctx.fillStyle = shieldGradient
          ctx.fill()

          // Add shield hexagon pattern
          const hexCount = 12
          for (let i = 0; i < hexCount; i++) {
            const hexAngle = (i / hexCount) * Math.PI * 2 + time * 0.0005
            const hexX = x + Math.cos(hexAngle) * size * 1.25 * shieldPulse
            const hexY = y + Math.sin(hexAngle) * size * 1.25 * shieldPulse
            const hexSize = size * 0.1

            ctx.beginPath()
            for (let j = 0; j < 6; j++) {
              const pointAngle = (j / 6) * Math.PI * 2
              const pointX = hexX + Math.cos(pointAngle) * hexSize
              const pointY = hexY + Math.sin(pointAngle) * hexSize

              if (j === 0) {
                ctx.moveTo(pointX, pointY)
              } else {
                ctx.lineTo(pointX, pointY)
              }
            }
            ctx.closePath()

            if (planet.faction === "dominion") {
              ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"
            } else if (planet.faction === "reformation") {
              ctx.strokeStyle = "rgba(65, 105, 225, 0.3)"
            } else {
              ctx.strokeStyle = "rgba(200, 200, 200, 0.3)"
            }

            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }

        // Draw planetary rings in front of the planet
        if (planet.importance === "capital" || planet.id === "asteria" || Math.random() > 0.7) {
          // Draw rings in front of the planet
          const ringWidth = size * 2.5
          const ringHeight = size * 0.5

          // Create ring gradient
          const ringGradient = ctx.createLinearGradient(x - ringWidth / 2, y, x + ringWidth / 2, y)

          // Different ring colors based on faction
          if (planet.faction === "dominion") {
            ringGradient.addColorStop(0, "rgba(255, 215, 0, 0)")
            ringGradient.addColorStop(0.2, "rgba(255, 215, 0, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(255, 215, 0, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(255, 215, 0, 0.2)")
            ringGradient.addColorStop(1, "rgba(255, 215, 0, 0)")
          } else if (planet.faction === "reformation") {
            ringGradient.addColorStop(0, "rgba(65, 105, 225, 0)")
            ringGradient.addColorStop(0.2, "rgba(65, 105, 225, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(65, 105, 225, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(65, 105, 225, 0.2)")
            ringGradient.addColorStop(1, "rgba(65, 105, 225, 0)")
          } else {
            ringGradient.addColorStop(0, "rgba(200, 200, 200, 0)")
            ringGradient.addColorStop(0.2, "rgba(200, 200, 200, 0.2)")
            ringGradient.addColorStop(0.5, "rgba(200, 200, 200, 0.5)")
            ringGradient.addColorStop(0.8, "rgba(200, 200, 200, 0.2)")
            ringGradient.addColorStop(1, "rgba(200, 200, 200, 0)")
          }

          // Save context for clipping
          ctx.save()

          // Create clipping region for the part of the rings in front of the planet
          ctx.beginPath()
          ctx.ellipse(x, y, ringWidth / 2, ringHeight / 2, 0, 0, Math.PI * 2)
          ctx.clip()

          // Create a second clip to exclude the planet itself
          ctx.beginPath()
          ctx.arc(x, y, size, 0, Math.PI * 2)
          ctx.clip("evenodd")

          // Draw the rings that are in front of the planet
          ctx.beginPath()
          ctx.ellipse(x, y, ringWidth / 2, ringHeight / 2, 0, 0, Math.PI * 2)
          ctx.fillStyle = ringGradient
          ctx.fill()

          // Restore context
          ctx.restore()
        }

        // Draw name for important planets or hovered/selected planets
        if (planet.importance === "capital" || planet.importance === "major" || isHovered || isSelected) {
          // Use site font instead of Arial
          ctx.font = `${isHovered || isSelected ? "bold " : ""}${Math.max(10, size)}px var(--font-sans), sans-serif`
          ctx.fillStyle = "rgba(32, 194, 214, 0.9)"
          ctx.textAlign = "center"
          ctx.fillText(planet.name, x, y + size * 1.5)

          // Draw faction indicator for important planets
          if (planet.importance === "capital" || isSelected) {
            ctx.font = `${Math.max(8, size * 0.7)}px var(--font-sans), sans-serif`
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
            ctx.fillText(
              planet.faction.charAt(0).toUpperCase() + planet.faction.slice(1),
              x,
              y + size * 1.5 + Math.max(12, size * 0.8),
            )
          }
        }
      })
    }

    // Animation
    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)" // Slightly transparent background for hologram effect
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Apply zoom transformation
      ctx.save()

      if (isZoomed && zoomTarget) {
        const zoomCenterX = zoomTarget.x * canvas.width
        const zoomCenterY = zoomTarget.y * canvas.height

        // Zoom in on the target
        ctx.translate(zoomCenterX, zoomCenterY)
        ctx.scale(zoomLevel, zoomLevel)
        ctx.translate(-zoomCenterX, -zoomCenterY)
      }

      // Draw background elements
      drawNebulae()
      drawEnergyFields(time)

      // Draw galaxy core
      drawGalaxyCore(time)

      // Draw stars with twinkle effect
      stars.forEach((star) => {
        if (isRotating) {
          // Rotate based on distance from center (inner stars rotate faster)
          star.angle += star.speed
        }

        // Calculate new position
        const newX = centerX + Math.cos(star.angle) * star.distance
        const newY = centerY + Math.sin(star.angle) * star.distance

        // Apply twinkle effect
        star.twinkle += star.twinkleSpeed
        const twinkleFactor = 0.7 + Math.sin(star.twinkle) * 0.3

        ctx.beginPath()
        ctx.arc(newX, newY, star.size * twinkleFactor, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.fill()
      })

      // Draw dust particles
      dustParticles.forEach((particle) => {
        if (isRotating) {
          // Move particles along their path
          particle.x += Math.cos(particle.angle) * particle.speed * particle.distance
          particle.y += Math.sin(particle.angle) * particle.speed * particle.distance

          // Wrap around if out of bounds
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0
        }

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      // Draw planets
      drawPlanets(time)

      ctx.restore()

      animationRef.current = requestAnimationFrame(render)
    }

    render(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRotating, hoveredPlanet, selectedPlanet, isZoomed, zoomTarget, zoomLevel])

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-default"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />

      {/* Hologram overlay canvas */}
      <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none" />

      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-2 bg-black/80 backdrop-blur-md border-cyan-400/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-cyan-400">{selectedPlanet.name}</CardTitle>
                  <Badge
                    className="text-xs border"
                    style={{
                      backgroundColor: `rgba(32, 194, 214, 0.2)`,
                      color: "rgb(32, 194, 214)",
                      borderColor: "rgb(32, 194, 214)",
                    }}
                  >
                    {selectedPlanet.faction.charAt(0).toUpperCase() + selectedPlanet.faction.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="text-sm opacity-80 text-cyan-200">
                  {selectedPlanet.importance === "capital"
                    ? "Capital World"
                    : selectedPlanet.importance === "major"
                      ? "Major World"
                      : "Minor World"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-cyan-100">{selectedPlanet.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 space-x-2">
        <AnimatePresence>
          {isZoomed && (
            <motion.button
              className="rounded border border-cyan-400/30 bg-black/70 px-3 py-1 text-sm text-cyan-400 hover:bg-cyan-900/20 backdrop-blur-sm"
              onClick={() => {
                setIsZoomed(false)
                setZoomLevel(1)
                setSelectedPlanet(null)
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              Reset View
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
