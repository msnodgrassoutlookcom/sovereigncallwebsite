"use client"

import { useVirtualizer } from "@tanstack/react-virtual"
import { useRef, memo, useEffect, useState } from "react"
import { PostItem } from "./post-item"

interface Post {
  id: string
  content: string
  created_at: string
  author: string
  author_avatar?: string
  reactions?: any[]
  // other post properties
}

interface OptimizedPostListProps {
  posts: Post[]
  threadId: string
}

// Memoized post item to prevent unnecessary re-renders
const MemoizedPostItem = memo(PostItem)

export function OptimizedPostList({ posts, threadId }: OptimizedPostListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [estimatedHeight, setEstimatedHeight] = useState(200)

  // Calculate average post height after first render
  useEffect(() => {
    if (parentRef.current && posts.length > 0) {
      const firstPost = parentRef.current.querySelector("[data-post-item]")
      if (firstPost) {
        setEstimatedHeight(firstPost.clientHeight)
      }
    }
  }, [posts])

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedHeight,
    overscan: 5, // Number of items to render outside of view
  })

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto" style={{ contain: "strict" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div data-post-item>
              <MemoizedPostItem post={posts[virtualItem.index]} threadId={threadId} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
