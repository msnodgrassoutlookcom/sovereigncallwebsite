"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { User, LogOut, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import MobileNav from "@/components/mobile-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PATREON_URL } from "@/lib/constants"
import { useEffect, useState } from "react"

const mainNav = [
  { title: "Home", href: "/" },
  { title: "News", href: "/news" },
  { title: "Forum", href: "/forum" },
  { title: "About", href: "/about" },
  {
    title: "Integration Tests",
    href: "/admin/integration-tests",
    admin: true,
  },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { isLoggedIn, user, logout } = useAuth()

  // State to manage cookie consent
  const [cookieConsent, setCookieConsent] = useState(false)

  // Load cookie consent from local storage on mount
  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent") === "true"
    setCookieConsent(consent)
  }, [])

  // Function to handle cookie consent acceptance
  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true")
    setCookieConsent(true)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Sovereign Call Logo" width={32} height={32} className="rounded-sm" />
            <span className="text-xl font-bold tracking-tight">Sovereign Call</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            href="/lore"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/lore" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Lore
          </Link>
          <Link
            href="/factions"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/factions") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Factions
          </Link>
          <Link
            href="/#characters"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Characters
          </Link>
          <Link
            href="/classes"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/classes" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Classes
          </Link>
          <Link
            href="/character-builder"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/character-builder" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Character Builder
          </Link>
          <Link
            href="/forum"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/forum") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Forum
          </Link>
          <Link
            href={PATREON_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Support Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <Settings className="mr-2 h-4 w-4" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/characters">
                    <User className="mr-2 h-4 w-4" />
                    My Characters
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
          <MobileNav />
        </div>
      </div>
      {/* Cookie Consent Banner */}
      {!cookieConsent && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-800 text-gray-100 py-3 px-6 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <p>
              We use cookies to enhance your experience. By using our site, you agree to our use of cookies.
              <Link href="/privacy" className="underline text-gray-200">
                Learn more
              </Link>
            </p>
            <Button size="sm" onClick={acceptCookies}>
              Accept
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

export default SiteHeader
