import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FactionCardProps {
  name: string
  description: string
  imageSrc?: string
  color: string
  href: string
}

export default function FactionCard({ name, description, imageSrc, color, href }: FactionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border">
      <div className="absolute inset-0 z-0">
        <div className={cn("absolute inset-0 bg-gradient-to-br", color)} />
        {imageSrc && (
          <Image
            src={imageSrc || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover brightness-[0.3] transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="relative z-10 p-6 text-white">
        <h3 className="text-2xl font-bold">{name}</h3>
        <p className="mt-2 text-white/80">{description}</p>
        <Link href={href}>
          <Button
            variant="outline"
            className="mt-4 border-white bg-transparent text-white hover:bg-white hover:text-black"
          >
            Learn More <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
