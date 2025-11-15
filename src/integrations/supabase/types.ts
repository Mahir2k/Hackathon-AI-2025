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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advisor_approvals: {
        Row: {
          advisor_comments: string | null
          id: string
          reviewed_at: string | null
          reviewer_id: string | null
          semester_plan_id: string
          status: Database["public"]["Enums"]["approval_status"] | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          advisor_comments?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          semester_plan_id: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          advisor_comments?: string | null
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string | null
          semester_plan_id?: string
          status?: Database["public"]["Enums"]["approval_status"] | null
          submitted_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_approvals_semester_plan_id_fkey"
            columns: ["semester_plan_id"]
            isOneToOne: false
            referencedRelation: "semester_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: Database["public"]["Enums"]["course_category"]
          code: string
          created_at: string | null
          credits: number
          department: string
          description: string | null
          difficulty: number | null
          id: string
          name: string
          prerequisites: string[] | null
          workload_hours: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["course_category"]
          code: string
          created_at?: string | null
          credits?: number
          department: string
          description?: string | null
          difficulty?: number | null
          id?: string
          name: string
          prerequisites?: string[] | null
          workload_hours?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["course_category"]
          code?: string
          created_at?: string | null
          credits?: number
          department?: string
          description?: string | null
          difficulty?: number | null
          id?: string
          name?: string
          prerequisites?: string[] | null
          workload_hours?: number | null
        }
        Relationships: []
      }
      course_offerings: {
        Row: {
          id: string
          course_id: string
          year: number
          season: Database["public"]["Enums"]["semester_season"]
          section: string | null
          crn: string | null
          instructor_name: string | null
          meeting_days: string[] | null
          start_time: string | null
          end_time: string | null
          location: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          course_id: string
          year: number
          season: Database["public"]["Enums"]["semester_season"]
          section?: string | null
          crn?: string | null
          instructor_name?: string | null
          meeting_days?: string[] | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          year?: number
          season?: Database["public"]["Enums"]["semester_season"]
          section?: string | null
          crn?: string | null
          instructor_name?: string | null
          meeting_days?: string[] | null
          start_time?: string | null
          end_time?: string | null
          location?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          college: string | null
          created_at: string | null
          email: string | null
          id: string
          major: string | null
          updated_at: string | null
        }
        Insert: {
          college?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          major?: string | null
          updated_at?: string | null
        }
        Update: {
          college?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          major?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      semester_plans: {
        Row: {
          ai_generated: boolean | null
          courses: string[] | null
          created_at: string | null
          id: string
          season: Database["public"]["Enums"]["semester_season"]
          user_id: string
          year: number
        }
        Insert: {
          ai_generated?: boolean | null
          courses?: string[] | null
          created_at?: string | null
          id?: string
          season: Database["public"]["Enums"]["semester_season"]
          user_id: string
          year: number
        }
        Update: {
          ai_generated?: boolean | null
          courses?: string[] | null
          created_at?: string | null
          id?: string
          season?: Database["public"]["Enums"]["semester_season"]
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      user_courses: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string | null
          grade: string | null
          id: string
          offering_id: string | null
          semester_season: Database["public"]["Enums"]["semester_season"] | null
          semester_year: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string | null
          grade?: string | null
          id?: string
          offering_id?: string | null
          semester_season?:
            | Database["public"]["Enums"]["semester_season"]
            | null
          semester_year?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string | null
          grade?: string | null
          id?: string
          offering_id?: string | null
          semester_season?:
            | Database["public"]["Enums"]["semester_season"]
            | null
          semester_year?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          goals: string[] | null
          id: string
          preferences: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          preferences?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goals?: string[] | null
          id?: string
          preferences?: string[] | null
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
      [_ in never]: never
    }
    Enums: {
      approval_status: "pending" | "approved" | "rejected"
      course_category: "Major" | "HSS" | "Tech" | "Free"
      semester_season: "Fall" | "Spring" | "Summer"
      user_role_type: "student" | "advisor"
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
      approval_status: ["pending", "approved", "rejected"],
      course_category: ["Major", "HSS", "Tech", "Free"],
      semester_season: ["Fall", "Spring", "Summer"],
      user_role_type: ["student", "advisor"],
    },
  },
} as const
