import Link from "next/link"
import { ExternalLink } from "lucide-react"

export function SiteFooter() {
  const patreonUrl =
    "https://patreon.com/sovereigncallofficial?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"

  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Sovereign's Call. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:underline hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline hover:text-foreground">
            Terms
          </Link>
          <Link href="/contact" className="hover:underline hover:text-foreground">
            Contact
          </Link>
          <a
            href={patreonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:underline hover:text-foreground"
          >
            Support Us <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
