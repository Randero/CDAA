export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          course_id: string | null
          created_at: string
          id: string
          instructor_id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string
          id?: string
          instructor_id: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string
          id?: string
          instructor_id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_late: boolean | null
          score: number | null
          student_id: string
          submission_text: string | null
          submission_url: string | null
          submitted_at: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          score?: number | null
          student_id: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          score?: number | null
          student_id?: string
          submission_text?: string | null
          submission_url?: string | null
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          instructor_id: string
          max_score: number | null
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructor_id: string
          max_score?: number | null
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructor_id?: string
          max_score?: number | null
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          actor_name: string | null
          actor_role: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_name?: string | null
          actor_role?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_alert: boolean | null
          is_pinned: boolean | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_alert?: boolean | null
          is_pinned?: boolean | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_alert?: boolean | null
          is_pinned?: boolean | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      certificate_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          template_html: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          template_html: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          template_html?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string
          course_name: string
          created_at: string
          id: string
          issued_at: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          student_name: string
          template_id: string | null
          user_id: string
          verification_id: string
        }
        Insert: {
          course_id: string
          course_name: string
          created_at?: string
          id?: string
          issued_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          student_name: string
          template_id?: string | null
          user_id: string
          verification_id: string
        }
        Update: {
          course_id?: string
          course_name?: string
          created_at?: string
          id?: string
          issued_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          student_name?: string
          template_id?: string | null
          user_id?: string
          verification_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      complaints: {
        Row: {
          created_at: string
          id: string
          message: string
          responded_at: string | null
          responded_by: string | null
          response: string | null
          status: string | null
          student_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          student_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          responded_at?: string | null
          responded_by?: string | null
          response?: string | null
          status?: string | null
          student_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      coupon_usages: {
        Row: {
          coupon_id: string
          course_id: string
          discount_applied: number
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          course_id: string
          discount_applied: number
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          course_id?: string
          discount_applied?: number
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usages_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usages_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applicable_courses: string[] | null
          code: string
          created_at: string
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_courses?: string[] | null
          code: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_courses?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      course_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      course_curriculum: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          section_title: string
          sort_order: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          section_title: string
          sort_order?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          section_title?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_curriculum_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_objectives: {
        Row: {
          course_id: string | null
          id: string
          objective: string
          sort_order: number | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          objective: string
          sort_order?: number | null
        }
        Update: {
          course_id?: string | null
          id?: string
          objective?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_objectives_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_requirements: {
        Row: {
          course_id: string | null
          id: string
          requirement: string
          sort_order: number | null
        }
        Insert: {
          course_id?: string | null
          id?: string
          requirement: string
          sort_order?: number | null
        }
        Update: {
          course_id?: string | null
          id?: string
          requirement?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_requirements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          category: Database["public"]["Enums"]["course_category"]
          certificate_enabled: boolean | null
          certificate_template_id: string | null
          created_at: string
          description: string
          duration: string | null
          id: string
          instructor_avatar: string | null
          instructor_id: string | null
          instructor_name: string
          instructor_title: string | null
          is_featured: boolean | null
          is_published: boolean | null
          lessons_count: number | null
          level: Database["public"]["Enums"]["course_level"]
          original_price: number | null
          price: number
          rating: number | null
          rejection_reason: string | null
          short_description: string | null
          slug: string
          status: Database["public"]["Enums"]["course_status"] | null
          students_count: number | null
          submitted_at: string | null
          thumbnail: string | null
          title: string
          total_points: number | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          category: Database["public"]["Enums"]["course_category"]
          certificate_enabled?: boolean | null
          certificate_template_id?: string | null
          created_at?: string
          description: string
          duration?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_id?: string | null
          instructor_name: string
          instructor_title?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_count?: number | null
          level: Database["public"]["Enums"]["course_level"]
          original_price?: number | null
          price?: number
          rating?: number | null
          rejection_reason?: string | null
          short_description?: string | null
          slug: string
          status?: Database["public"]["Enums"]["course_status"] | null
          students_count?: number | null
          submitted_at?: string | null
          thumbnail?: string | null
          title: string
          total_points?: number | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          category?: Database["public"]["Enums"]["course_category"]
          certificate_enabled?: boolean | null
          certificate_template_id?: string | null
          created_at?: string
          description?: string
          duration?: string | null
          id?: string
          instructor_avatar?: string | null
          instructor_id?: string | null
          instructor_name?: string
          instructor_title?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          lessons_count?: number | null
          level?: Database["public"]["Enums"]["course_level"]
          original_price?: number | null
          price?: number
          rating?: number | null
          rejection_reason?: string | null
          short_description?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["course_status"] | null
          students_count?: number | null
          submitted_at?: string | null
          thumbnail?: string | null
          title?: string
          total_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_certificate_template_id_fkey"
            columns: ["certificate_template_id"]
            isOneToOne: false
            referencedRelation: "certificate_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      curriculum_lessons: {
        Row: {
          content: string | null
          created_at: string
          curriculum_id: string | null
          duration: string | null
          id: string
          lesson_type: string | null
          sort_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          curriculum_id?: string | null
          duration?: string | null
          id?: string
          lesson_type?: string | null
          sort_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          curriculum_id?: string | null
          duration?: string | null
          id?: string
          lesson_type?: string | null
          sort_order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curriculum_lessons_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "course_curriculum"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          progress: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          progress?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          progress?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      instructors: {
        Row: {
          avatar: string | null
          bio: string | null
          courses_count: number | null
          created_at: string
          expertise: string[] | null
          id: string
          name: string
          rating: number | null
          students_count: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          courses_count?: number | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          name: string
          rating?: number | null
          students_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          courses_count?: number | null
          created_at?: string
          expertise?: string[] | null
          id?: string
          name?: string
          rating?: number | null
          students_count?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      learning_path_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          learning_path_id: string
          sort_order: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          learning_path_id: string
          sort_order?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          learning_path_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_courses_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          level: string | null
          name: string
          slug: string
          sort_order: number | null
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name: string
          slug: string
          sort_order?: number | null
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "curriculum_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          coupon_id: string | null
          course_id: string
          created_at: string
          discount_amount: number | null
          gateway_response: Json | null
          id: string
          original_amount: number
          payment_gateway: string | null
          payment_reference: string | null
          payment_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          course_id: string
          created_at?: string
          discount_amount?: number | null
          gateway_response?: Json | null
          id?: string
          original_amount: number
          payment_gateway?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          course_id?: string
          created_at?: string
          discount_amount?: number | null
          gateway_response?: Json | null
          id?: string
          original_amount?: number
          payment_gateway?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      platform_stats: {
        Row: {
          icon: string | null
          id: string
          label: string
          sort_order: number | null
          stat_key: string
          stat_value: string
          updated_at: string
        }
        Insert: {
          icon?: string | null
          id?: string
          label: string
          sort_order?: number | null
          stat_key: string
          stat_value: string
          updated_at?: string
        }
        Update: {
          icon?: string | null
          id?: string
          label?: string
          sort_order?: number | null
          stat_key?: string
          stat_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          last_login_at: string | null
          suspended_at: string | null
          suspended_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_login_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          last_login_at?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answer_text: string
          created_at: string
          id: string
          is_correct: boolean | null
          question_id: string
          sort_order: number | null
        }
        Insert: {
          answer_text: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id: string
          sort_order?: number | null
        }
        Update: {
          answer_text?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          attempt_number: number | null
          completed_at: string | null
          created_at: string
          earned_points: number | null
          id: string
          passed: boolean | null
          quiz_id: string
          score: number | null
          started_at: string
          student_id: string
          time_spent: number | null
          total_points: number | null
        }
        Insert: {
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string
          earned_points?: number | null
          id?: string
          passed?: boolean | null
          quiz_id: string
          score?: number | null
          started_at?: string
          student_id: string
          time_spent?: number | null
          total_points?: number | null
        }
        Update: {
          attempt_number?: number | null
          completed_at?: string | null
          created_at?: string
          earned_points?: number | null
          id?: string
          passed?: boolean | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          time_spent?: number | null
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          points: number | null
          question_text: string
          question_type: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id?: string
          points?: number | null
          question_text: string
          question_type?: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          points?: number | null
          question_text?: string
          question_type?: Database["public"]["Enums"]["quiz_question_type"]
          quiz_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          attempt_id: string
          created_at: string
          id: string
          is_correct: boolean | null
          points_earned: number | null
          question_id: string
          selected_answer_id: string | null
          text_response: string | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id: string
          selected_answer_id?: string | null
          text_response?: string | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          id?: string
          is_correct?: boolean | null
          points_earned?: number | null
          question_id?: string
          selected_answer_id?: string | null
          text_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "quiz_answers"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          course_id: string
          created_at: string
          curriculum_id: string | null
          description: string | null
          id: string
          instructor_id: string
          is_published: boolean | null
          max_attempts: number | null
          passing_score: number | null
          show_correct_answers: boolean | null
          shuffle_questions: boolean | null
          time_limit: number | null
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          curriculum_id?: string | null
          description?: string | null
          id?: string
          instructor_id: string
          is_published?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          show_correct_answers?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          curriculum_id?: string | null
          description?: string | null
          id?: string
          instructor_id?: string
          is_published?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          show_correct_answers?: boolean | null
          shuffle_questions?: boolean | null
          time_limit?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_curriculum_id_fkey"
            columns: ["curriculum_id"]
            isOneToOne: false
            referencedRelation: "course_curriculum"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          instructor_id: string
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          instructor_id: string
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          instructor_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar: string | null
          bio: string | null
          created_at: string
          id: string
          linkedin: string | null
          name: string
          role: string
          sort_order: number | null
          twitter: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name: string
          role: string
          sort_order?: number | null
          twitter?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          linkedin?: string | null
          name?: string
          role?: string
          sort_order?: number | null
          twitter?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar: string | null
          company: string | null
          content: string
          country: string | null
          course_title: string | null
          created_at: string
          id: string
          is_featured: boolean | null
          name: string
          rating: number | null
          role: string | null
        }
        Insert: {
          avatar?: string | null
          company?: string | null
          content: string
          country?: string | null
          course_title?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
        }
        Update: {
          avatar?: string | null
          company?: string | null
          content?: string
          country?: string | null
          course_title?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
        }
        Relationships: []
      }
      transcript_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_id: string
          transcript_url: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
          transcript_url?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
          transcript_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id: string
          p_entity_type: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "instructor" | "student"
      course_category:
        | "penetration-testing"
        | "network-security"
        | "incident-response"
        | "cloud-security"
        | "security-fundamentals"
        | "malware-analysis"
      course_level: "beginner" | "intermediate" | "advanced"
      course_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "archived"
      quiz_question_type: "multiple_choice" | "true_false" | "short_answer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "instructor", "student"],
      course_category: [
        "penetration-testing",
        "network-security",
        "incident-response",
        "cloud-security",
        "security-fundamentals",
        "malware-analysis",
      ],
      course_level: ["beginner", "intermediate", "advanced"],
      course_status: ["draft", "submitted", "approved", "rejected", "archived"],
      quiz_question_type: ["multiple_choice", "true_false", "short_answer"],
    },
  },
} as const
