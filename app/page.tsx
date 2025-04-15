"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import FactionCard from "@/components/faction-card"
import dynamic from "next/dynamic"
import GalaxyFallback from "@/components/galaxy-fallback"

// Dynamically import the Galaxy Model with no SSR
const GalaxyModel = dynamic(() => import("@/components/galaxy-model"), {
  ssr: false,
  loading: () => <GalaxyFallback />,
})

const supportUrl =
  "https://patreon.com/sovereigncallofficial?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/background.png"
            alt="Sovereign Call - Two warriors facing off with energy weapons"
            fill
            className="object-cover brightness-[0.7]"
            priority
            sizes="100vw"
          />
        </div>
        <div className="container relative z-10 flex flex-col items-center justify-center py-24 text-center md:py-32 lg:py-40">
          <Image src="/images/logo.png" alt="Sovereign Call Logo" width={120} height={120} className="mb-6" priority />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block text-primary">Sovereign Call</span>
            <span className="mt-2 block text-white">A New Era Awaits</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white md:text-xl">
            In a world where the King is silent, two factions rise to interpret his will. Choose your allegiance between
            the Dominion and the Reformation in this immersive third-person sci-fi RPG.
          </p>
          <div className="mt-10">
            <a href={supportUrl} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                Support Development Of the Game <ChevronRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Lore Section */}
      <section id="lore" className="bg-muted py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">The Silent King</h2>
              <p className="mt-4 text-muted-foreground">
                For centuries, the King has ruled with wisdom and justice. But now, he has fallen silent, communicating
                only through cryptic messages and ancient protocols. In his absence of clear direction, two factions
                have emerged to interpret his will and guide the kingdom.
              </p>
              <p className="mt-4 text-muted-foreground">
                As chaos spreads throughout the stars, you must navigate a complex web of loyalty, power, and ancient
                technology to discover the truth behind the King's silence.
              </p>
              <Link href="/timeline">
                <Button variant="link" className="mt-4 p-0">
                  Explore Full Timeline <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="overflow-hidden rounded-lg">
                <Image
                  src="/images/lore/silent-king.png"
                  alt="The Silent King overlooking the city with Dominion and Reformation guards"
                  width={600}
                  height={600}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Factions Section */}
      <section id="factions" className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Choose Your Allegiance
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-muted-foreground">
            Two powerful factions vie for control, each claiming to be the true interpreters of the King's will. Your
            choice will shape the future of the kingdom and your own destiny.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <FactionCard
              name="The Dominion"
              description="Traditionalists who believe in strict adherence to the King's established protocols. They maintain that order must be preserved at all costs, even if it means sacrificing freedom for security."
              color="from-amber-800 to-yellow-700"
              href="/factions/dominion"
            />

            <FactionCard
              name="The Reformation"
              description="Progressives who interpret the King's silence as a call for change. They seek to reform the kingdom's ancient systems and believe that adaptation is necessary for survival."
              color="from-gray-700 to-gray-500"
              href="/factions/reformation"
            />
          </div>
        </div>
      </section>

      {/* Characters Section */}
      <section id="characters" className="bg-muted py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Key Characters</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-muted-foreground">
            Meet the influential figures who shape the world of Sovereign Call.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Emperor Caelus Virel",
                role: "Self Declared Dominion Emperor",
                description:
                  "Commands the largest military force in the Reach. Revered as a god-king by his people, feared by all others. His rule fuels expansion, oppression, and the ideological arms race across the galaxy.",
                imageSrc: "/images/characters/emperor-caelus-virel.png",
              },
              {
                name: "Chancellor Aeryn Vos",
                role: "Reformation Chancellor",
                description:
                  "Controls the Reformation's neural grid, surveillance networks, and societal restructuring programs. Every law, algorithm, and dataflow bends to her will.",
                imageSrc: "/images/characters/chancellor-aeryn-vos.png",
                objectPosition: "top center", // This centers the face in the square frame
              },
              {
                name: "The King",
                role: "The Last Light",
                description:
                  "The King commands immense spiritual loyalty from millions scattered across colonies. His presence alone can inspire uprisings.",
                imageSrc: "/images/characters/the-king.png",
              },
              {
                name: "Lyessa Caedryn",
                role: "The Knife Behind the Throne",
                description: "Mastermind behind betrayals, insurgencies, and psychological operations.",
                imageSrc: "/images/characters/lyessa-caedryn.png",
                objectPosition: "center top", // This centers the face in the square frame
              },
              {
                name: "Tarrik Walcur",
                role: "The Blade of the Throne",
                description:
                  "A rising icon within the Dominion ranks, his choices will either uphold or unravel the empire.",
                imageSrc: "/images/characters/tarrik-walcur.png",
                objectPosition: "center top", // This centers the face in the square frame
              },
              {
                name: "Admiral Vex Auren",
                role: "The Executioner",
                description:
                  "Enforces ideological discipline through calculated terror. Oversees planetary pacification efforts and AI-warfare deployments.",
                imageSrc: "/images/characters/admiral-vex-auren.png",
                objectPosition: "center top", // This centers the face in the square frame
              },
            ].map((character, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="aspect-square overflow-hidden rounded-md">
                  <Image
                    src={character.imageSrc || "/placeholder.svg"}
                    alt={character.name}
                    width={200}
                    height={200}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ objectPosition: character.objectPosition || "center" }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold">{character.name}</h3>
                  <p className="text-sm text-primary">{character.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{character.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Galaxy Map Section */}
      <section id="galaxy-map" className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Explore The Reach</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-muted-foreground">
            Navigate the vast expanse of the galaxy known as The Reach, home to countless worlds, ancient mysteries, and
            the ongoing conflict between the Dominion and Reformation.
          </p>

          <div className="mt-12">{isClient ? <GalaxyModel /> : <GalaxyFallback />}</div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border bg-background/50 p-6">
              <h3 className="text-xl font-bold text-amber-500">Dominion Territory</h3>
              <p className="mt-2 text-muted-foreground">
                The central systems of the Reach, including the Throneworld of Lyr, are under strict Dominion control.
                These worlds are characterized by imposing architecture, military presence, and unwavering loyalty to
                Emperor Virel.
              </p>
            </div>
            <div className="rounded-lg border bg-background/50 p-6">
              <h3 className="text-xl font-bold text-blue-400">Reformation Territory</h3>
              <p className="mt-2 text-muted-foreground">
                The outer systems embrace the progressive ideals of the Reformation. These worlds feature cutting-edge
                technology, experimental social structures, and a focus on adaptation and change.
              </p>
            </div>
            <div className="rounded-lg border bg-background/50 p-6">
              <h3 className="text-xl font-bold text-purple-400">Contested Regions</h3>
              <p className="mt-2 text-muted-foreground">
                Between the territories of the major factions lie contested regions where independent colonies,
                mercenary groups, and ancient ruins create opportunities and dangers for those who venture there.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
