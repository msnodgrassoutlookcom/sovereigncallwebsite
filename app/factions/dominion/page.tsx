import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function DominionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 to-amber-900">
      <div className="container mx-auto py-8">
        <Link href="/#factions">
          <Button
            variant="outline"
            className="mb-8 border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Factions
          </Button>
        </Link>

        <div className="rounded-lg bg-black/40 p-8 backdrop-blur-sm">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-amber-500">
              <Image
                src="/images/characters/emperor-caelus-virel.png"
                alt="Emperor Caelus Virel"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="ml-6">
              <h1 className="text-4xl font-bold text-amber-500 md:text-5xl">The Dominion</h1>
              <p className="text-xl text-amber-300">Order Through Strength</p>
            </div>
          </div>

          <div className="prose prose-invert mx-auto max-w-4xl prose-headings:text-amber-500 prose-a:text-amber-400">
            <h2>History</h2>
            <p>
              The Dominion emerged from the King's elite guard, tasked with maintaining order throughout the kingdom.
              When the King fell silent, they interpreted his last directives as a mandate to preserve the established
              order at all costs. Under the leadership of Emperor Caelus Virel, the Dominion has transformed from a
              peacekeeping force into a military empire.
            </p>

            <h2>Philosophy</h2>
            <p>
              The Dominion believes in strict adherence to the King's established protocols. They maintain that order
              must be preserved at all costs, even if it means sacrificing freedom for security. They view the King's
              silence not as abandonment, but as a test of their loyalty and resolve.
            </p>
            <p>Their core tenets include:</p>
            <ul>
              <li>Unwavering loyalty to the King's last known directives</li>
              <li>Preservation of hierarchical order and traditional power structures</li>
              <li>Strength through unity and discipline</li>
              <li>Sacrifice of individual freedoms for collective security</li>
            </ul>

            <h2>Territory</h2>
            <p>
              The Dominion controls the central systems of the kingdom, including the capital world where the King's
              palace stands. Their territory is characterized by imposing architecture, strict surveillance, and visible
              military presence. Citizens enjoy protection and stability, but at the cost of personal freedoms.
            </p>

            <h2>Military</h2>
            <p>
              The Dominion possesses the largest and most disciplined military force in the kingdom. Their troops are
              known for their unwavering loyalty and willingness to sacrifice for the greater good. The military
              hierarchy is rigid, with advancement based on demonstrated loyalty and combat effectiveness.
            </p>
            <p>Key military assets include:</p>
            <ul>
              <li>The Imperial Fleet, commanded by Admiral Vex Auren</li>
              <li>The Phoenix Guard, elite soldiers personally loyal to Emperor Caelus</li>
              <li>Automated enforcement drones programmed to maintain order</li>
              <li>Planetary defense systems capable of destroying entire fleets</li>
            </ul>

            <h2>Key Figures</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-amber-500">Emperor Caelus Virel</h3>
                <p className="text-sm text-amber-300">Self-Declared Dominion Emperor</p>
                <p className="mt-2 text-gray-300">
                  Commands the largest military force in the Reach. Revered as a god-king by his people, feared by all
                  others. His rule fuels expansion, oppression, and the ideological arms race across the galaxy.
                </p>
              </div>
              <div className="rounded-lg border border-amber-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-amber-500">Admiral Vex Auren</h3>
                <p className="text-sm text-amber-300">The Executioner</p>
                <p className="mt-2 text-gray-300">
                  Enforces ideological discipline through calculated terror. Oversees planetary pacification efforts and
                  AI-warfare deployments.
                </p>
              </div>
              <div className="rounded-lg border border-amber-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-amber-500">Tarrik Walcur</h3>
                <p className="text-sm text-amber-300">The Blade of the Throne</p>
                <p className="mt-2 text-gray-300">
                  A rising icon within the Dominion ranks, his choices will either uphold or unravel the empire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
