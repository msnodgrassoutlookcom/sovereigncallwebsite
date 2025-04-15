import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function FactionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Choose Your Allegiance</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Two powerful factions vie for control, each claiming to be the true interpreters of the King's will.
            <br />
            Your choice will shape the future of the kingdom and your own destiny.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Dominion Section */}
          <div className="group relative overflow-hidden rounded-lg border border-amber-700/30">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-yellow-700 opacity-70" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 relative h-24 w-24 overflow-hidden rounded-full border-4 border-amber-500 bg-black/50">
                <Image
                  src="/images/characters/emperor-caelus-virel.png"
                  alt="Emperor Caelus Virel"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <h2 className="text-3xl font-bold text-amber-400">The Dominion</h2>
              <p className="mt-2 text-lg text-amber-200">Order Through Strength</p>
              <p className="mt-4 text-white/80">
                Traditionalists who believe in strict adherence to the King's established protocols. They maintain that
                order must be preserved at all costs, even if it means sacrificing freedom for security.
              </p>
              <div className="mt-8 flex flex-col items-center">
                <p className="mb-2 text-amber-300">Led by Emperor Caelus Virel</p>
                <Link href="/factions/dominion">
                  <Button
                    size="lg"
                    className="border-amber-500 bg-transparent text-amber-400 hover:bg-amber-500 hover:text-black"
                    variant="outline"
                  >
                    Join the Dominion <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Reformation Section */}
          <div className="group relative overflow-hidden rounded-lg border border-gray-500/30">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-500 opacity-70" />
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-6 relative h-24 w-24 overflow-hidden rounded-full border-4 border-blue-400 bg-black/50">
                <Image
                  src="/images/characters/chancellor-aeryn-vos.png"
                  alt="Chancellor Aeryn Vos"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <h2 className="text-3xl font-bold text-blue-400">The Reformation</h2>
              <p className="mt-2 text-lg text-blue-200">Progress Through Change</p>
              <p className="mt-4 text-white/80">
                Progressives who interpret the King's silence as a call for change. They seek to reform the kingdom's
                ancient systems and believe that adaptation is necessary for survival.
              </p>
              <div className="mt-8 flex flex-col items-center">
                <p className="mb-2 text-blue-300">Led by Chancellor Aeryn Vos</p>
                <Link href="/factions/reformation">
                  <Button
                    size="lg"
                    className="border-blue-400 bg-transparent text-blue-400 hover:bg-blue-400 hover:text-black"
                    variant="outline"
                  >
                    Join the Reformation <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-lg bg-black/30 p-8">
          <h2 className="text-2xl font-bold">The Conflict</h2>
          <p className="mt-4 text-muted-foreground">
            For centuries, the galaxy existed in harmony under the guidance of the King. But when he fell silent,
            communicating only through cryptic messages and ancient protocols, two interpretations of his will emerged.
          </p>
          <p className="mt-4 text-muted-foreground">
            The Dominion believes in preserving the established order at all costs, while the Reformation sees the
            King's silence as a call for change and adaptation. This ideological divide has split the kingdom, with each
            faction claiming to be the true interpreters of the King's will.
          </p>
          <p className="mt-4 text-muted-foreground">
            As a new arrival in this fractured kingdom, your allegiance will shape not only your own destiny but the
            future of countless worlds. Choose wisely, for in the game of power, there are no neutral parties.
          </p>
        </div>
      </div>
    </div>
  )
}
