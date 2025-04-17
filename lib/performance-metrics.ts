import { onCLS, onFID, onLCP, onTTFB } from "web-vitals"
import { getRedisClient } from "./redis"

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

    captureWebVitals()
  }
}

export function captureWebVitals() {
  // Core Web Vitals
  onCLS((metric) => sendToAnalytics("CLS", metric))
  onFID((metric) => sendToAnalytics("FID", metric))
  onLCP((metric) => sendToAnalytics("LCP", metric))
  onTTFB((metric) => sendToAnalytics("TTFB", metric))
}

function sendToAnalytics(metricName: string, metric: any) {
  // Use existing metrics endpoint
  fetch("/api/system/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: metricName,
      value: metric.value,
      id: metric.id,
      page: window.location.pathname,
      timestamp: Date.now(),
    }),
    keepalive: true,
  })
}

/**
 * Record a custom metric.  This could be expanded to use Redis or other storage.
 */
async function recordMetric(name: string, value: number, type: string) {
  try {
    const redis = await getRedisClient()
    if (!redis) {
      console.warn("Redis client not available, skipping metric recording.")
      return
    }

    const key = `metric:${name}`
    const timestamp = Date.now()

    // Store the metric as a JSON string
    await redis.xadd(key, "*", {
      value: String(value),
      timestamp: String(timestamp),
      type: type,
    })

    // Optionally, set a TTL for the metric data
    await redis.expire(key, 3600) // Keep metrics for 1 hour

    console.log(`Recorded metric ${name}: ${value} (${type})`)
  } catch (error) {
    console.error(`Failed to record metric ${name}:`, error)
  }
}

/**
 * Performance tracking middleware
 */
export function withPerformanceTracking(handler: Function, operationName: string) {
  return async (request: Request) => {
    const start = Date.now()
    const response = await handler(request)
    const timeMs = Date.now() - start

    // Record metric in background (don't await)
    recordMetric(`${operationName}.response_time`, timeMs, "histogram").catch(console.error)

    return response
  }
}
