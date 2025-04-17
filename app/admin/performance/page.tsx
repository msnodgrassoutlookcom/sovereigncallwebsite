import { PerformanceDashboard } from "@/components/admin/performance-dashboard"

export default function PerformancePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Performance Monitoring</h1>
      <p className="text-muted-foreground mb-8">
        Monitor real-time performance metrics for your application. These metrics are collected from actual user
        sessions.
      </p>

      <PerformanceDashboard />

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">About Web Vitals</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Largest Contentful Paint (LCP)</h3>
            <p className="text-sm text-muted-foreground">
              Measures loading performance. To provide a good user experience, LCP should occur within 2.5 seconds of
              when the page first starts loading.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">First Input Delay (FID)</h3>
            <p className="text-sm text-muted-foreground">
              Measures interactivity. To provide a good user experience, pages should have a FID of 100 milliseconds or
              less.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Cumulative Layout Shift (CLS)</h3>
            <p className="text-sm text-muted-foreground">
              Measures visual stability. To provide a good user experience, pages should maintain a CLS of 0.1 or less.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Time to First Byte (TTFB)</h3>
            <p className="text-sm text-muted-foreground">
              Measures the time it takes for the browser to receive the first byte of content. A good TTFB is under
              800ms.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
