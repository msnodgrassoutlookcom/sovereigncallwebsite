import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId

    const { data, error } = await supabase.from("forum_categories").select("*").eq("id", categoryId).single()

    if (error) {
      console.error("Error fetching forum category:", error)
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Get thread and post counts
    const { count: threadCount } = await supabase
      .from("forum_threads")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)

    const { count: postCount } = await supabase
      .from("forum_posts")
      .select("*, forum_threads!inner(*)", { count: "exact", head: true })
      .eq("forum_threads.category_id", categoryId)

    return NextResponse.json({
      ...data,
      thread_count: threadCount,
      post_count: postCount,
    })
  } catch (error) {
    console.error("Unexpected error fetching forum category:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId
    const body = await request.json()
    const { name, description, icon, order } = body

    const { data, error } = await supabase
      .from("forum_categories")
      .update({
        name,
        description,
        icon,
        order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", categoryId)
      .select()

    if (error) {
      console.error("Error updating forum category:", error)
      return NextResponse.json({ error: "Failed to update forum category" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error updating forum category:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { categoryId: string } }) {
  try {
    const categoryId = params.categoryId

    const { error } = await supabase.from("forum_categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting forum category:", error)
      return NextResponse.json({ error: "Failed to delete forum category" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error deleting forum category:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
