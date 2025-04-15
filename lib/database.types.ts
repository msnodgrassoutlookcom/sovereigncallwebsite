export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password: string
          email: string
          created_at: string
          reset_token: string | null
          reset_token_expiry: string | null
          profile_picture_url: string | null
          email_verified: boolean | null
          verification_token: string | null
          verification_token_expiry: string | null
          notification_preferences: Json | null
        }
        Insert: {
          id: string
          username: string
          password: string
          email: string
          created_at?: string
          reset_token?: string | null
          reset_token_expiry?: string | null
          profile_picture_url?: string | null
          email_verified?: boolean | null
          verification_token?: string | null
          verification_token_expiry?: string | null
          notification_preferences?: Json | null
        }
        Update: {
          id?: string
          username?: string
          password?: string
          email?: string
          created_at?: string
          reset_token?: string | null
          reset_token_expiry?: string | null
          profile_picture_url?: string | null
          email_verified?: boolean | null
          verification_token?: string | null
          verification_token_expiry?: string | null
          notification_preferences?: Json | null
        }
      }
      characters: {
        Row: {
          id: string
          user_id: string
          name: string
          faction: string | null
          gender: string | null
          combat_class: string | null
          story_class: string | null
          created_at: string
          portrait_url: string | null
        }
        Insert: {
          id: string
          user_id: string
          name: string
          faction?: string | null
          gender?: string | null
          combat_class?: string | null
          story_class?: string | null
          created_at?: string
          portrait_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          faction?: string | null
          gender?: string | null
          combat_class?: string | null
          story_class?: string | null
          created_at?: string
          portrait_url?: string | null
        }
      }
      forum_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          category_id: string
          user_id: string
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          category_id: string
          user_id: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category_id?: string
          user_id?: string
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      forum_posts: {
        Row: {
          id: string
          thread_id: string
          user_id: string
          content: string
          is_edited: boolean
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          thread_id: string
          user_id: string
          content: string
          is_edited?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          user_id?: string
          content?: string
          is_edited?: boolean
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forum_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
      }
      forum_attachments: {
        Row: {
          id: string
          post_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id: string
          post_id: string
          file_url: string
          file_name: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          file_url?: string
          file_name?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
      }
    }
  }
}
