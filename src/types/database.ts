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
      competitions: {
        Row: {
          created_at: string
          description: string
          fee: number
          id: string
          is_active: boolean
          max_members: number
          min_members: number
          name: string
          qris_public_id: string | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          slug: string
          type: Database["public"]["Enums"]["competition_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          fee?: number
          id?: string
          is_active?: boolean
          max_members?: number
          min_members?: number
          name: string
          qris_public_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          slug: string
          type: Database["public"]["Enums"]["competition_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          fee?: number
          id?: string
          is_active?: boolean
          max_members?: number
          min_members?: number
          name?: string
          qris_public_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          slug?: string
          type?: Database["public"]["Enums"]["competition_type"]
          updated_at?: string
        }
        Relationships: []
      }
      cp_problem_scores: {
        Row: {
          achieved_at: string
          best_score: number
          best_submission_id: string
          problem_id: string
          registration_id: string
          solved: boolean
        }
        Insert: {
          achieved_at: string
          best_score: number
          best_submission_id: string
          problem_id: string
          registration_id: string
          solved?: boolean
        }
        Update: {
          achieved_at?: string
          best_score?: number
          best_submission_id?: string
          problem_id?: string
          registration_id?: string
          solved?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cp_problem_scores_best_submission_id_fkey"
            columns: ["best_submission_id"]
            isOneToOne: false
            referencedRelation: "cp_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "cp_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_problems: {
        Row: {
          competition_id: string
          constraints: string
          created_at: string
          id: string
          input_format: string
          is_published: boolean
          level: number
          memory_limit_kb: number
          output_format: string
          points: number
          statement: string
          time_limit_ms: number
          title: string
          updated_at: string
        }
        Insert: {
          competition_id: string
          constraints?: string
          created_at?: string
          id?: string
          input_format?: string
          is_published?: boolean
          level: number
          memory_limit_kb?: number
          output_format?: string
          points: number
          statement: string
          time_limit_ms?: number
          title: string
          updated_at?: string
        }
        Update: {
          competition_id?: string
          constraints?: string
          created_at?: string
          id?: string
          input_format?: string
          is_published?: boolean
          level?: number
          memory_limit_kb?: number
          output_format?: string
          points?: number
          statement?: string
          time_limit_ms?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cp_problems_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_problems_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_scores: {
        Row: {
          competition_id: string
          last_improved_at: string | null
          registration_id: string
          solved: number
          team_name: string
          total_points: number
          updated_at: string
        }
        Insert: {
          competition_id: string
          last_improved_at?: string | null
          registration_id: string
          solved?: number
          team_name: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          competition_id?: string
          last_improved_at?: string | null
          registration_id?: string
          solved?: number
          team_name?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cp_scores_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_scores_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_scores_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_scores_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_sessions: {
        Row: {
          competition_id: string
          created_at: string
          ended_at: string | null
          id: string
          scheduled_end_at: string | null
          scheduled_start_at: string | null
          started_at: string | null
          started_by: string | null
          status: Database["public"]["Enums"]["cp_session_status"]
          submission_cooldown_seconds: number
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["cp_session_status"]
          submission_cooldown_seconds?: number
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          scheduled_end_at?: string | null
          scheduled_start_at?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["cp_session_status"]
          submission_cooldown_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cp_sessions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: true
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_sessions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: true
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_sessions_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_submission_results: {
        Row: {
          id: number
          memory_kb: number | null
          message: string | null
          submission_id: string
          test_case_id: string
          time_ms: number | null
          verdict: Database["public"]["Enums"]["cp_verdict"]
        }
        Insert: {
          id?: never
          memory_kb?: number | null
          message?: string | null
          submission_id: string
          test_case_id: string
          time_ms?: number | null
          verdict: Database["public"]["Enums"]["cp_verdict"]
        }
        Update: {
          id?: never
          memory_kb?: number | null
          message?: string | null
          submission_id?: string
          test_case_id?: string
          time_ms?: number | null
          verdict?: Database["public"]["Enums"]["cp_verdict"]
        }
        Relationships: [
          {
            foreignKeyName: "cp_submission_results_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "cp_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submission_results_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "cp_test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_submissions: {
        Row: {
          compile_output: string | null
          created_at: string
          efficiency: number
          id: string
          language: Database["public"]["Enums"]["cp_language"]
          max_memory_kb: number | null
          max_time_ms: number | null
          passed: number
          problem_id: string
          registration_id: string
          score: number
          source_code: string
          total: number
          user_id: string | null
          verdict: Database["public"]["Enums"]["cp_verdict"]
        }
        Insert: {
          compile_output?: string | null
          created_at?: string
          efficiency?: number
          id?: string
          language: Database["public"]["Enums"]["cp_language"]
          max_memory_kb?: number | null
          max_time_ms?: number | null
          passed: number
          problem_id: string
          registration_id: string
          score?: number
          source_code: string
          total: number
          user_id?: string | null
          verdict: Database["public"]["Enums"]["cp_verdict"]
        }
        Update: {
          compile_output?: string | null
          created_at?: string
          efficiency?: number
          id?: string
          language?: Database["public"]["Enums"]["cp_language"]
          max_memory_kb?: number | null
          max_time_ms?: number | null
          passed?: number
          problem_id?: string
          registration_id?: string
          score?: number
          source_code?: string
          total?: number
          user_id?: string | null
          verdict?: Database["public"]["Enums"]["cp_verdict"]
        }
        Relationships: [
          {
            foreignKeyName: "cp_submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "cp_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_test_cases: {
        Row: {
          created_at: string
          expected_output: string
          id: string
          input: string
          is_sample: boolean
          ordinal: number
          problem_id: string
        }
        Insert: {
          created_at?: string
          expected_output: string
          id?: string
          input?: string
          is_sample?: boolean
          ordinal: number
          problem_id: string
        }
        Update: {
          created_at?: string
          expected_output?: string
          id?: string
          input?: string
          is_sample?: boolean
          ordinal?: number
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cp_test_cases_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "cp_problems"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      registration_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          note: string | null
          registration_id: string
          status: Database["public"]["Enums"]["registration_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: never
          note?: string | null
          registration_id: string
          status: Database["public"]["Enums"]["registration_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: never
          note?: string | null
          registration_id?: string
          status?: Database["public"]["Enums"]["registration_status"]
        }
        Relationships: [
          {
            foreignKeyName: "registration_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_events_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_events_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_members: {
        Row: {
          competition_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_leader: boolean
          nisn: string
          phone: string | null
          registration_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_leader?: boolean
          nisn: string
          phone?: string | null
          registration_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_leader?: boolean
          nisn?: string
          phone?: string | null
          registration_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_members_registration_fkey"
            columns: ["registration_id", "competition_id"]
            isOneToOne: false
            referencedRelation: "registration_overview"
            referencedColumns: ["id", "competition_id"]
          },
          {
            foreignKeyName: "registration_members_registration_fkey"
            columns: ["registration_id", "competition_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id", "competition_id"]
          },
          {
            foreignKeyName: "registration_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          leader_id: string
          payment_proof_format: string | null
          payment_proof_public_id: string | null
          payment_submitted_at: string | null
          referral_code: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["registration_status"]
          team_name: string
          updated_at: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          leader_id?: string
          payment_proof_format?: string | null
          payment_proof_public_id?: string | null
          payment_submitted_at?: string | null
          referral_code?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name: string
          updated_at?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          leader_id?: string
          payment_proof_format?: string | null
          payment_proof_public_id?: string | null
          payment_submitted_at?: string | null
          referral_code?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      competition_stats: {
        Row: {
          accepted_people: number | null
          accepted_teams: number | null
          competition_id: string | null
          name: string | null
          total_teams: number | null
          type: Database["public"]["Enums"]["competition_type"] | null
          under_review_teams: number | null
        }
        Relationships: []
      }
      registration_overview: {
        Row: {
          competition_id: string | null
          competition_name: string | null
          competition_type:
            | Database["public"]["Enums"]["competition_type"]
            | null
          created_at: string | null
          id: string | null
          leader_email: string | null
          leader_name: string | null
          leader_nisn: string | null
          leader_phone: string | null
          member_count: number | null
          payment_proof_public_id: string | null
          payment_submitted_at: string | null
          referral_code: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          team_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_save_problem: {
        Args: { p_problem: Json; p_test_cases: Json }
        Returns: string
      }
      cp_access: {
        Args: never
        Returns: {
          competition_id: string
          registration_id: string
          session_status: Database["public"]["Enums"]["cp_session_status"]
        }[]
      }
      create_registration: {
        Args: {
          p_competition_id: string
          p_leader_name: string
          p_leader_nisn: string
          p_leader_phone: string
          p_team_name: string
        }
        Returns: string
      }
      join_team: {
        Args: {
          p_full_name: string
          p_nisn: string
          p_phone?: string
          p_referral_code: string
        }
        Returns: string
      }
      preview_team: {
        Args: { p_referral_code: string }
        Returns: {
          competition_name: string
          is_joinable: boolean
          leader_name: string
          max_members: number
          member_count: number
          team_name: string
        }[]
      }
    }
    Enums: {
      competition_type: "competitive_programming" | "logic"
      cp_language: "python" | "cpp" | "java"
      cp_session_status: "scheduled" | "live" | "ended"
      cp_verdict:
        | "accepted"
        | "wrong_answer"
        | "time_limit_exceeded"
        | "compilation_error"
        | "runtime_error_sigsegv"
        | "runtime_error_sigxfsz"
        | "runtime_error_sigfpe"
        | "runtime_error_sigabrt"
        | "runtime_error_nzec"
        | "runtime_error_other"
        | "internal_error"
        | "exec_format_error"
      registration_status:
        | "pending_payment"
        | "under_review"
        | "accepted"
        | "rejected"
      user_role: "participant" | "admin"
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
      competition_type: ["competitive_programming", "logic"],
      cp_language: ["python", "cpp", "java"],
      cp_session_status: ["scheduled", "live", "ended"],
      cp_verdict: [
        "accepted",
        "wrong_answer",
        "time_limit_exceeded",
        "compilation_error",
        "runtime_error_sigsegv",
        "runtime_error_sigxfsz",
        "runtime_error_sigfpe",
        "runtime_error_sigabrt",
        "runtime_error_nzec",
        "runtime_error_other",
        "internal_error",
        "exec_format_error",
      ],
      registration_status: [
        "pending_payment",
        "under_review",
        "accepted",
        "rejected",
      ],
      user_role: ["participant", "admin"],
    },
  },
} as const
