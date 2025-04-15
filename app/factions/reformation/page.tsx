import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function ReformationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto py-8">
        <Link href="/#factions">
          <Button
            variant="outline"
            className="mb-8 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Factions
          </Button>
        </Link>

        <div className="rounded-lg bg-black/40 p-8 backdrop-blur-sm">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-blue-400">
              <Image
                src="/images/characters/chancellor-aeryn-vos.png"
                alt="Chancellor Aeryn Vos"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="ml-6">
              <h1 className="text-4xl font-bold text-blue-400 md:text-5xl">The Reformation</h1>
              <p className="text-xl text-blue-300">Progress Through Change</p>
            </div>
          </div>

          <div className="prose prose-invert mx-auto max-w-4xl prose-headings:text-blue-400 prose-a:text-blue-300">
            <h2>History</h2>
            <p>
              The Reformation began as a coalition of scientists, engineers, and progressive nobles who believed the
              kingdom's ancient systems were becoming obsolete. When the King fell silent, they saw an opportunity to
              implement necessary changes that had long been resisted by traditionalists. Under Chancellor Aeryn Vos,
              they have grown from a fringe movement into a formidable power.
            </p>

            <h2>Philosophy</h2>
            <p>
              The Reformation interprets the King's silence as a call for change. They believe that adaptation is
              necessary for survival, and that the King's protocols were meant to evolve with the times. They see
              themselves not as rebels, but as the true interpreters of the King's vision for a constantly improving
              society.
            </p>
            <p>Their core tenets include:</p>
            <ul>
              <li>Technological advancement and innovation as moral imperatives</li>
              <li>Decentralization of power through neural networks and collective decision-making</li>
              <li>Adaptation as the key to survival and prosperity</li>
              <li>Questioning of traditions that no longer serve their original purpose</li>
            </ul>

            <h2>Territory</h2>
            <p>
              The Reformation controls the outer systems of the kingdom, including major research hubs and manufacturing
              centers. Their territories are characterized by cutting-edge technology, experimental social structures,
              and rapid development. Citizens enjoy greater personal freedoms but face uncertainty as systems constantly
              evolve.
            </p>

            <h2>Technology</h2>
            <p>
              The Reformation's greatest strength lies in its technological innovation. Their neural grids allow for
              unprecedented connectivity and information sharing, while their adaptive AI systems constantly improve
              efficiency. However, these rapid advancements sometimes outpace ethical considerations.
            </p>
            <p>Key technological assets include:</p>
            <ul>
              <li>The Neural Grid, a vast network connecting citizens' minds to shared information</li>
              <li>Adaptive combat drones that evolve tactics based on battlefield data</li>
              <li>Experimental energy weapons that bypass traditional defenses</li>
              <li>Quantum communication systems immune to conventional surveillance</li>
            </ul>

            <h2>Key Figures</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-blue-400">Chancellor Aeryn Vos</h3>
                <p className="text-sm text-blue-300">Reformation Chancellor</p>
                <p className="mt-2 text-gray-300">
                  Controls the Reformation's neural grid, surveillance networks, and societal restructuring programs.
                  Every law, algorithm, and dataflow bends to her will.
                </p>
              </div>
              <div className="rounded-lg border border-blue-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-blue-400">Lyessa Caedryn</h3>
                <p className="text-sm text-blue-300">The Knife Behind the Throne</p>
                <p className="mt-2 text-gray-300">
                  Mastermind behind betrayals, insurgencies, and psychological operations. Her covert networks have
                  infiltrated even the most secure Dominion strongholds.
                </p>
              </div>
              <div className="rounded-lg border border-blue-700 bg-black/30 p-4">
                <h3 className="text-xl font-bold text-blue-400">Oracle Zephyr</h3>
                <p className="text-sm text-blue-300">Royal Interpreter</p>
                <p className="mt-2 text-gray-300">
                  One of the few who can still communicate with the Silent King, though their interpretations are often
                  cryptic and contested by the Dominion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
