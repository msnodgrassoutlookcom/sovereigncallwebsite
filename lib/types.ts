// Existing types...

// Forum types
export interface ForumCategory {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
  updated_at: string
}

export interface ForumThread {
  id: string
  title: string
  category_id: string
  user_id: string
  is_pinned: boolean
  is_locked: boolean
  view_count: number
  created_at: string
  updated_at: string
  // Additional fields for UI
  author?: string
  post_count?: number
  last_post_at?: string
}

export interface ForumPost {
  id: string
  thread_id: string
  user_id: string
  content: string
  is_edited: boolean
  parent_id: string | null
  created_at: string
  updated_at: string
  // Additional fields for UI
  author?: string
  author_avatar?: string
  reactions?: ForumReaction[]
}

export interface ForumReaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: string
  created_at: string
  // Additional fields for UI
  count?: number
  reacted?: boolean
}

export interface ForumAttachment {
  id: string
  post_id: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}
