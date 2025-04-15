"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, LogIn, User, LogOut, Settings, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Sovereign Call Logo" width={24} height={24} className="rounded-sm" />
            <span className="text-lg font-bold">Sovereign Call</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="mt-8 flex flex-col gap-4">
          <Link
            href="/"
            className="text-lg font-medium transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/lore"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Lore
          </Link>
          <Link
            href="/factions"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Factions
          </Link>
          <Link
            href="#characters"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Characters
          </Link>
          <Link
            href="/classes"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Classes
          </Link>
          <Link
            href="/character-builder"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Character Builder
          </Link>
          <Link
            href="/timeline"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Timeline
          </Link>
          <Link
            href="/forum"
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            <MessageSquare className="mr-2 inline-block h-4 w-4" /> Forum
          </Link>

          <div className="mt-4 border-t pt-4">
            {isLoggedIn ? (
              <>
                <div className="mb-2 text-sm text-muted-foreground">Logged in as {user?.username}</div>
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Account Settings
                </Link>
                <Link
                  href="/account/characters"
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <User className="h-4 w-4" /> My Characters
                </Link>
                <button
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <LogIn className="h-4 w-4" /> Log In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  <User className="h-4 w-4" /> Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
