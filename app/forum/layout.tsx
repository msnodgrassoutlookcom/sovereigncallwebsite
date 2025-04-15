import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Forum | Sovereign's Call",
  description: "Join discussions about Sovereign's Call with other players",
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8">
      <Tabs defaultValue="discussions" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="discussions" asChild>
              <a href="/forum">Discussions</a>
            </TabsTrigger>
            <TabsTrigger value="announcements" asChild>
              <a href="/forum/announcements">Announcements</a>
            </TabsTrigger>
            <TabsTrigger value="guides" asChild>
              <a href="/forum/guides">Guides</a>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="discussions" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </TabsContent>
        <TabsContent value="announcements" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </TabsContent>
        <TabsContent value="guides" className="space-y-4">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
