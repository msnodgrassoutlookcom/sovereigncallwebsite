import CacheHitRateChart from "@/components/admin/cache-hit-rate-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Database, RefreshCcw, Trash2 } from "lucide-react"

export const metadata = {
  title: "Cache Dashboard | Sovereign's Call Admin",
  description: "Monitor and manage Redis cache performance",
}

export default function CacheDashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin/diagnostics">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Diagnostics
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Cache Dashboard</h1>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="management">Cache Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6">
            <CacheHitRateChart />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">Cache Performance Tips</h2>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">•</span>
                    <span>Aim for a hit rate above 80% for optimal performance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">•</span>
                    <span>Consider increasing TTL for frequently accessed data.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">•</span>
                    <span>Use cache tags to efficiently invalidate related cache entries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 text-green-500">•</span>
                    <span>Implement stale-while-revalidate for high-traffic endpoints.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">Current Redis Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Connection Status</h3>
                    <p className="text-lg font-medium">
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                      Connected
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Provider</h3>
                    <p className="text-lg font-medium">Upstash</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Cache Size</h3>
                    <p className="text-lg font-medium">--</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Uptime</h3>
                    <p className="text-lg font-medium">--</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <div className="space-y-6">
            <div className="rounded-lg border p-6">
              <h2 className="mb-4 text-xl font-semibold">Cache Management</h2>
              <p className="mb-6 text-muted-foreground">
                Use these tools to manage your Redis cache. Be careful with cache invalidation operations.
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-2 font-medium">Invalidate All Cache</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Clear all cached data. Use with caution as this will cause temporary performance degradation.
                  </p>
                  <form action="/api/admin/cache/invalidate-all">
                    <Button type="submit" variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear All Cache
                    </Button>
                  </form>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-2 font-medium">Flush Cache Stats</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Reset hit and miss counters without affecting cached data.
                  </p>
                  <form action="/api/admin/cache/reset-stats">
                    <Button type="submit" variant="outline" className="w-full">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Reset Stats
                    </Button>
                  </form>
                </div>

                <div className="rounded-lg border bg-card p-4">
                  <h3 className="mb-2 font-medium">Redis Health Check</h3>
                  <p className="mb-4 text-sm text-muted-foreground">Check Redis server status and performance.</p>
                  <Link href="/api/system/redis-health">
                    <Button variant="outline" className="w-full">
                      <Database className="mr-2 h-4 w-4" />
                      View Health Info
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
