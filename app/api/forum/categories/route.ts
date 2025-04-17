import { NextResponse } from "next/server"
import { cache } from "@/lib/cache"
import { sql } from "@/lib/db"

// Add caching headers and optimize query
export async function GET() {
  try {
    // Use cache with appropriate TTL
    const categories = await cache(
      "forum:categories",
      async () => {
        // Optimized query with proper indexing
        const { rows } = await sql`
          SELECT 
            c.id, 
            c.name, 
            c.description,
            COUNT(DISTINCT t.id) as thread_count,
            MAX(t.created_at) as last_activity
          FROM categories c
          LEFT JOIN threads t ON c.id = t.category_id
          GROUP BY c.id, c.name, c.description
          ORDER BY c.display_order ASC
        `
        return rows
      },
      60 * 5, // 5 minute cache
      { tags: ["forum", "categories"] },
    )

    // Add cache control headers
    const response = NextResponse.json(categories)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=60")

    return response
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
