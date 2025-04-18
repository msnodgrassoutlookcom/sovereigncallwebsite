import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { Toaster } from "@/components/ui/toaster"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import DonationBanner from "@/components/donation-banner"
import ClientInit from "@/app/client-init"

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Add display swap
  preload: true, // Ensure preloading
})

export const metadata = {
  title: "Sovereign Call - A Third-Person Sci-Fi RPG",
  description:
    "In a world where the King is silent, two factions rise to interpret his will. Choose your allegiance between the Dominion and the Reformation in this immersive third-person sci-fi RPG.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: { url: "/apple-icon.png", type: "image/png" },
  },
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical assets */}
        <link rel="preload" href="/images/logo.png" as="image" />
        <link rel="preload" href="/images/hero/background.png" as="image" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ClientInit />
            <DonationBanner />
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
