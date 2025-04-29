export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_data: {
        Row: {
          created_at: string | null
          department: string
          id: string
          last_login: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string
          id: string
          last_login?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          id?: string
          last_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          room_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          room_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          room_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_private: boolean | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string | null
          id: string
          registered_at: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          registered_at?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          registered_at?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_datetime: string
          event_type: string
          highlights: string[] | null
          id: string
          image_url: string | null
          is_public: boolean
          location_type: string
          physical_address: string | null
          start_datetime: string
          title: string
          updated_at: string | null
          virtual_meeting_url: string | null
        }
        Insert: {
          attendees_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime: string
          event_type?: string
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          location_type?: string
          physical_address?: string | null
          start_datetime: string
          title: string
          updated_at?: string | null
          virtual_meeting_url?: string | null
        }
        Update: {
          attendees_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime?: string
          event_type?: string
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean
          location_type?: string
          physical_address?: string | null
          start_datetime?: string
          title?: string
          updated_at?: string | null
          virtual_meeting_url?: string | null
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          order_num: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          order_num?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          order_num?: number | null
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_accepted: boolean | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      home_page_sections: {
        Row: {
          button_link: string | null
          button_text: string | null
          content: string | null
          created_at: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean | null
          section_key: string
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key: string
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_key?: string
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      home_page_stats: {
        Row: {
          created_at: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          button_link: string | null
          button_text: string | null
          content: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean | null
          section_name: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string
          display_order: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_name: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          content?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          section_name?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_stats: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_order: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      important_members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          display_order: number
          expertise: string[] | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          role: string
          twitter_url: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_order?: number
          expertise?: string[] | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          role: string
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          display_order?: number
          expertise?: string[] | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          role?: string
          twitter_url?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      introduction_requests: {
        Row: {
          created_at: string
          id: string
          intermediary_id: string
          message: string | null
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          intermediary_id: string
          message?: string | null
          requester_id: string
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          intermediary_id?: string
          message?: string | null
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          download_count: number | null
          format: string
          id: string
          name: string
          size: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          format: string
          id?: string
          name: string
          size: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          download_count?: number | null
          format?: string
          id?: string
          name?: string
          size?: string
          url?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          contact_email: string | null
          created_at: string
          first_name: string
          id: string
          industry: string | null
          interests: string[] | null
          last_name: string
          linkedin: string | null
          location: string | null
          role: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          contact_email?: string | null
          created_at?: string
          first_name: string
          id?: string
          industry?: string | null
          interests?: string[] | null
          last_name: string
          linkedin?: string | null
          location?: string | null
          role?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          contact_email?: string | null
          created_at?: string
          first_name?: string
          id?: string
          industry?: string | null
          interests?: string[] | null
          last_name?: string
          linkedin?: string | null
          location?: string | null
          role?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      membership_applications: {
        Row: {
          created_at: string
          department: string
          expectations: string | null
          id: string
          interests: string[]
          phone: string
          previous_experience: string | null
          status: string
          updated_at: string
          user_id: string
          year_of_study: string
        }
        Insert: {
          created_at?: string
          department: string
          expectations?: string | null
          id?: string
          interests: string[]
          phone: string
          previous_experience?: string | null
          status?: string
          updated_at?: string
          user_id: string
          year_of_study: string
        }
        Update: {
          created_at?: string
          department?: string
          expectations?: string | null
          id?: string
          interests?: string[]
          phone?: string
          previous_experience?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          year_of_study?: string
        }
        Relationships: []
      }
      mentor_data: {
        Row: {
          created_at: string | null
          expertise: string[]
          id: string
          last_login: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expertise?: string[]
          id: string
          last_login?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expertise?: string[]
          id?: string
          last_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string
          expertise: string[] | null
          hourly_rate: number | null
          id: string
          is_approved: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string
          expertise?: string[] | null
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_sessions: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          id: string
          meeting_link: string | null
          mentee_id: string
          mentor_id: string
          scheduled_at: string
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration: number
          id?: string
          meeting_link?: string | null
          mentee_id: string
          mentor_id: string
          scheduled_at: string
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          meeting_link?: string | null
          mentee_id?: string
          mentor_id?: string
          scheduled_at?: string
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          notification_type: string
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          notification_type?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      past_recordings: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          event_id: string
          id: string
          is_public: boolean | null
          presenter_name: string | null
          recorded_at: string | null
          recording_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          event_id: string
          id?: string
          is_public?: boolean | null
          presenter_name?: string | null
          recorded_at?: string | null
          recording_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          event_id?: string
          id?: string
          is_public?: boolean | null
          presenter_name?: string | null
          recorded_at?: string | null
          recording_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "past_recordings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          location: string | null
          photo_url: string | null
          profession: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          photo_url?: string | null
          profession?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          photo_url?: string | null
          profession?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      resource_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          attachment_url: string | null
          category_id: string
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_premium: boolean | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          attachment_url?: string | null
          category_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          attachment_url?: string | null
          category_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          category: string
          config_key: string
          config_value: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          category: string
          config_key: string
          config_value?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          config_key?: string
          config_value?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      slide_images: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order: number
          id?: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          logo_url: string | null
          partnership_end_date: string | null
          partnership_start_date: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          display_order: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          partnership_end_date?: string | null
          partnership_start_date?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      startup_members: {
        Row: {
          id: string
          joined_at: string
          role: string | null
          startup_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string | null
          startup_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string | null
          startup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_members_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          created_at: string
          description: string | null
          founder_id: string
          founding_date: string | null
          funding_stage: string | null
          github_url: string | null
          id: string
          industry: string | null
          instagram_url: string | null
          is_featured: boolean | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          team_size: number | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          founder_id: string
          founding_date?: string | null
          funding_stage?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          team_size?: number | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          founder_id?: string
          founding_date?: string | null
          funding_stage?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          instagram_url?: string | null
          is_featured?: boolean | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          team_size?: number | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      success_stories: {
        Row: {
          achievements: string[] | null
          company_name: string
          created_at: string
          description: string
          featured: boolean | null
          founder: string
          id: string
          image_url: string | null
          industry: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          achievements?: string[] | null
          company_name: string
          created_at?: string
          description: string
          featured?: boolean | null
          founder: string
          id?: string
          image_url?: string | null
          industry?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          achievements?: string[] | null
          company_name?: string
          created_at?: string
          description?: string
          featured?: boolean | null
          founder?: string
          id?: string
          image_url?: string | null
          industry?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: string
          created_at: string
          download_count: number | null
          format: string
          id: string
          name: string
          size: string
          url: string
        }
        Insert: {
          category: string
          created_at?: string
          download_count?: number | null
          format: string
          id?: string
          name: string
          size: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          download_count?: number | null
          format?: string
          id?: string
          name?: string
          size?: string
          url?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          name: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string | null
          display_order: number
          id?: string
          is_active?: boolean | null
          name: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          name?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          notification_preferences: Json | null
          privacy_settings: Json | null
          theme_preference: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement: {
        Args: { row_id: string; table_name: string; column_name: string }
        Returns: number
      }
      increment: {
        Args: { row_id: string; table_name: string; column_name: string }
        Returns: number
      }
      increment_recording_view_count: {
        Args: { recording_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_event_image: {
        Args: { event_id: string; new_image_url: string }
        Returns: undefined
      }
      update_slides_order: {
        Args: { slides_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
