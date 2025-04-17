import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const categoryId = url.searchParams.get("categoryId")
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10)
    const pageSize = Number.parseInt(url.searchParams.get("pageSize") || "20", 10)
    const offset = (page - 1) * pageSize

    // Validate pagination parameters
    if (pageSize > 50) {
      return NextResponse.json({ error: "Page size cannot exceed 50" }, { status: 400 })
    }

    // Optimized query with pagination and proper joins
    const { rows: threads } = await sql`
      WITH thread_stats AS (
        SELECT 
          thread_id,
          COUNT(*) as reply_count,
          MAX(created_at) as last_reply_at
        FROM posts
        GROUP BY thread_id
      )
      SELECT 
        t.id,
        t.title,
        t.created_at,
        t.user_id,
        u.username as author_name,
        COALESCE(ts.reply_count, 0) as reply_count,
        COALESCE(ts.last_reply_at, t.created_at) as last_activity
      FROM threads t
      LEFT JOIN thread_stats ts ON t.id = ts.thread_id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE ${categoryId ? sql`t.category_id = ${categoryId}` : sql`1=1`}
      ORDER BY last_activity DESC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `

    // Get total count for pagination
    const { rows: countResult } = await sql`
      SELECT COUNT(*) as total
      FROM threads
      WHERE ${categoryId ? sql`category_id = ${categoryId}` : sql`1=1`}
    `

    const total = Number.parseInt(countResult[0].total, 10)
    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      threads,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching threads:", error)
    return NextResponse.json({ error: "Failed to fetch threads" }, { status: 500 })
  }
}
