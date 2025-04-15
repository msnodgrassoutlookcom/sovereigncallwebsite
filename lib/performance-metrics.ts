// Performance monitoring utilities

/**
 * Track and report page load metrics
 */
export function reportPageLoadMetrics() {
  if (typeof window === "undefined") return

  try {
    // Wait for the page to fully load
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        const paintEntries = performance.getEntriesByType("paint")

        const fcp = paintEntries.find((entry) => entry.name === "first-contentful-paint")?.startTime || 0
        const lcp = getLCP()

        const metrics = {
          // Navigation timing
          pageLoadTime: navigation.loadEventEnd - navigation.startTime,
          ttfb: navigation.responseStart - navigation.requestStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
          domInteractive: navigation.domInteractive - navigation.startTime,

          // Paint timing
          firstPaint: paintEntries.find((entry) => entry.name === "first-paint")?.startTime || 0,
          firstContentfulPaint: fcp,
          largestContentfulPaint: lcp,

          // Resource timing
          resourceCount: performance.getEntriesByType("resource").length,
          resourceLoadTime: getTotalResourceLoadTime(),

          // Page URL (for analysis)
          page: window.location.pathname,

          // Timestamp
          timestamp: new Date().toISOString(),
        }

        // Send metrics to analytics endpoint
        sendMetricsToAnalytics(metrics)

        // Log metrics to console in development
        if (process.env.NODE_ENV === "development") {
          console.log("Page Performance Metrics:", metrics)
        }
      }, 0)
    })
  } catch (error) {
    console.error("Error reporting performance metrics:", error)
  }
}

/**
 * Get Largest Contentful Paint value
 */
function getLCP(): number {
  try {
    const entries = performance.getEntriesByType("element") as PerformanceElementTiming[]
    if (!entries || entries.length === 0) return 0

    // Find the largest element by renderTime
    return Math.max(...entries.map((entry) => entry.renderTime || 0))
  } catch (error) {
    return 0
  }
}

/**
 * Calculate total resource load time
 */
function getTotalResourceLoadTime(): number {
  try {
    const resources = performance.getEntriesByType("resource")
    let totalTime = 0

    resources.forEach((resource) => {
      totalTime += resource.duration
    })

    return totalTime
  } catch (error) {
    return 0
  }
}

/**
 * Send metrics to analytics endpoint
 */
async function sendMetricsToAnalytics(metrics: any) {
  try {
    await fetch("/api/system/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metrics),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    })
  } catch (error) {
    console.error("Failed to send metrics:", error)
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window !== "undefined") {
    // Report page load metrics
    reportPageLoadMetrics()

    // Monitor route changes for SPA navigation
    document.addEventListener("routeChangeComplete", (url) => {
      console.log(`Route changed to: ${url}`)
      // Reset performance metrics for the new route
      performance.mark("routeChangeStart")
    })
  }
}
