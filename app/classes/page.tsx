import Link from "next/link"
import { ArrowLeft, Target, Shield, Ghost, Flame, Sword, Swords, Zap, Axe, Brain } from "lucide-react"

import { Button } from "@/components/ui/button"
import ClassCard from "@/components/class-card"

export default function ClassesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="container mx-auto py-8">
        <Link href="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>

        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Combat Classes</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Choose your path in the conflict between the Dominion and the Reformation
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-blue-400">Ranged Specialists</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ClassCard
              name="STRIKER"
              tagline="One shot. One reckoning."
              description="Precision incarnate. Strikers eliminate high-value targets from afar using rifles, bows, or rail-based tech. Every shot is calculated, every trigger pull decisive."
              highlights="Critical hits, enemy marking, anti-ability suppression."
              color="from-blue-900 to-blue-700"
              icon={<Target className="h-6 w-6" />}
              type="ranged"
            />
            <ClassCard
              name="WARDEN"
              tagline="Hold the line, choke the field."
              description="Experts in control and suppression, Wardens lock down terrain and deny movement with mines, repeaters, and autonomous tools. Where a Warden walks, chaos stalls."
              highlights="Traps, zoning tools, deployable turrets or gadgets."
              color="from-blue-900 to-blue-700"
              icon={<Shield className="h-6 w-6" />}
              type="ranged"
            />
            <ClassCard
              name="VEILRUNNER"
              tagline="Blink in. Bleed them out."
              description="Stealthy and fast, Veilrunners strike from the shadows, vanish into cover, and thrive on confusion. They wield pistols or light weapons—never staying in one place for long."
              highlights="Invisibility, evasive movement, bonus damage from stealth."
              color="from-blue-900 to-blue-700"
              icon={<Ghost className="h-6 w-6" />}
              type="ranged"
            />
            <ClassCard
              name="ARBITER"
              tagline="Judgment is elemental."
              description="Channeling tech or power through specialized ranged weaponry, Arbiters inflict debilitating status effects and unleash raw energy. Whether flame, frost, or voltage—they make pain beautiful."
              highlights="AoE blasts, elemental damage, status detonations."
              color="from-blue-900 to-blue-700"
              icon={<Flame className="h-6 w-6" />}
              type="ranged"
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-amber-400">Melee Specialists</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <ClassCard
              name="VANGUARD"
              tagline="Precision in motion."
              description="Disciplined, efficient, lethal. The Vanguard walks the line between control and destruction, channeling decades of martial doctrine into elegant, deadly form."
              highlights="Single Energy Blade, balanced offense and defense, counter-attacks."
              color="from-amber-900 to-amber-700"
              icon={<Sword className="h-6 w-6" />}
              type="melee"
            />
            <ClassCard
              name="SERAPH"
              tagline="Death from all sides."
              description="To wield a blade at both ends is to declare war in every direction. Seraphs are whirling storms of energy, balancing aggression and grace with unwavering precision."
              highlights="Double-Sided Energy Blade, area control, spinning attacks."
              color="from-amber-900 to-amber-700"
              icon={<Swords className="h-6 w-6" />}
              type="melee"
            />
            <ClassCard
              name="REVENANT"
              tagline="Swift and merciless."
              description="Feral and fast. Revenants tear across battlefields with reckless abandon, striking from unexpected angles and disappearing before the smoke clears."
              highlights="Dual Energy Blades, rapid strikes, mobility."
              color="from-amber-900 to-amber-700"
              icon={<Zap className="h-6 w-6" />}
              type="melee"
            />
            <ClassCard
              name="BASTION"
              tagline="Unstoppable force."
              description="Massive, deliberate, unstoppable. The Bastion wields a two-handed blade of raw power, favoring overwhelming force and crowd-breaking arcs over finesse."
              highlights="Energy Greatsword, heavy attacks, crowd control."
              color="from-amber-900 to-amber-700"
              icon={<Axe className="h-6 w-6" />}
              type="melee"
            />
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-center text-2xl font-bold text-purple-400">Special Class</h2>
          <div className="mx-auto max-w-md">
            <ClassCard
              name="ARCANIST"
              tagline="The mind is the weapon."
              description="The mind is the weapon. Arcanists use neural amplifiers to manipulate light, energy, and even memory—bending battlefield physics with elegant devastation."
              highlights="Neuralcaster, energy manipulation, battlefield control."
              color="from-purple-900 to-purple-700"
              icon={<Brain className="h-6 w-6" />}
              type="special"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
