import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getUserFromRequest } from "@/lib/auth"

export async function PUT(request: Request, { params }: { params: { postId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const postId = params.postId
    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Check if post exists and user is authorized
    const { data: post, error: postError } = await supabase.from("forum_posts").select("*").eq("id", postId).single()

    if (postError) {
      console.error("Error fetching forum post:", postError)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only allow the post creator or an admin to update the post
    // Check if user has a role property and if it's admin
    const isAdmin = user.role === "admin"
    if (post.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this post" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("forum_posts")
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()

    if (error) {
      console.error("Error updating forum post:", error)
      return NextResponse.json({ error: "Failed to update forum post" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Unexpected error updating forum post:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const postId = params.postId

    // Check if post exists and user is authorized
    const { data: post, error: postError } = await supabase
      .from("forum_posts")
      .select("*, forum_threads!inner(*)")
      .eq("id", postId)
      .single()

    if (postError) {
      console.error("Error fetching forum post:", postError)
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only allow the post creator, thread creator, or an admin to delete the post
    // Check if user has a role property and if it's admin
    const isAdmin = user.role === "admin"
    if (post.user_id !== user.id && post.forum_threads.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this post" }, { status: 403 })
    }

    // Check if this is the only post in the thread
    const { count } = await supabase
      .from("forum_posts")
      .select("*", { count: "exact", head: true })
      .eq("thread_id", post.thread_id)

    if (count === 1) {
      // This is the only post, delete the thread instead
      const { error } = await supabase.from("forum_threads").delete().eq("id", post.thread_id)

      if (error) {
        console.error("Error deleting forum thread:", error)
        return NextResponse.json({ error: "Failed to delete forum thread" }, { status: 500 })
      }
    } else {
      // Delete just this post
      const { error } = await supabase.from("forum_posts").delete().eq("id", postId)

      if (error) {
        console.error("Error deleting forum post:", error)
        return NextResponse.json({ error: "Failed to delete forum post" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error deleting forum post:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
