export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: { p_usename: string }
        Returns: {
          password: string
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  private: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assert_cp_competition: {
        Args: { p_competition_id: string }
        Returns: undefined
      }
      assert_team_valid: {
        Args: { p_registration_id: string; p_require_min?: boolean }
        Returns: undefined
      }
      can_view_problem: { Args: { p_problem_id: string }; Returns: boolean }
      competition_open: { Args: { p_competition_id: string }; Returns: boolean }
      cp_is_live: { Args: { p_competition_id: string }; Returns: boolean }
      generate_referral_code: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_cp_participant: {
        Args: { p_competition_id: string }
        Returns: boolean
      }
      is_team_leader: { Args: { p_registration_id: string }; Returns: boolean }
      is_team_member: { Args: { p_registration_id: string }; Returns: boolean }
      is_trusted: { Args: never; Returns: boolean }
      registration_editable: {
        Args: { p_registration_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      competitions: {
        Row: {
          bank_account_holder: string | null
          bank_account_number: string | null
          created_at: string
          description: string
          fee: number
          id: string
          is_active: boolean
          max_members: number
          min_members: number
          name: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          qris_public_id: string | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          slug: string
          twibbon_url: string | null
          type: Database["public"]["Enums"]["competition_type"]
          updated_at: string
        }
        Insert: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          created_at?: string
          description?: string
          fee?: number
          id?: string
          is_active?: boolean
          max_members?: number
          min_members?: number
          name: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          qris_public_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          slug: string
          twibbon_url?: string | null
          type: Database["public"]["Enums"]["competition_type"]
          updated_at?: string
        }
        Update: {
          bank_account_holder?: string | null
          bank_account_number?: string | null
          created_at?: string
          description?: string
          fee?: number
          id?: string
          is_active?: boolean
          max_members?: number
          min_members?: number
          name?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          qris_public_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          slug?: string
          twibbon_url?: string | null
          type?: Database["public"]["Enums"]["competition_type"]
          updated_at?: string
        }
        Relationships: []
      }
      cp_leaderboard_snapshots: {
        Row: {
          competition_id: string
          last_improved_at: string | null
          registration_id: string
          solved: number
          team_name: string
          total_points: number
        }
        Insert: {
          competition_id: string
          last_improved_at?: string | null
          registration_id: string
          solved?: number
          team_name: string
          total_points?: number
        }
        Update: {
          competition_id?: string
          last_improved_at?: string | null
          registration_id?: string
          solved?: number
          team_name?: string
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "cp_leaderboard_snapshots_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_leaderboard_snapshots_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "cp_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_problem_id_fkey"
            columns: ["problem_id"]
            referencedRelation: "cp_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_problem_scores_registration_id_fkey"
            columns: ["registration_id"]
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
          difficulty: Database["public"]["Enums"]["cp_difficulty"]
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
          difficulty?: Database["public"]["Enums"]["cp_difficulty"]
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
          difficulty?: Database["public"]["Enums"]["cp_difficulty"]
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
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_problems_competition_id_fkey"
            columns: ["competition_id"]
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
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_scores_competition_id_fkey"
            columns: ["competition_id"]
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_scores_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_scores_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      cp_sessions: {
        Row: {
          competition_id: string
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          leaderboard_frozen_at: string | null
          paused_at: string | null
          paused_seconds: number
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
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          leaderboard_frozen_at?: string | null
          paused_at?: string | null
          paused_seconds?: number
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
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          leaderboard_frozen_at?: string | null
          paused_at?: string | null
          paused_seconds?: number
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
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "cp_sessions_competition_id_fkey"
            columns: ["competition_id"]
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_sessions_started_by_fkey"
            columns: ["started_by"]
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
            referencedRelation: "cp_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submission_results_test_case_id_fkey"
            columns: ["test_case_id"]
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
            referencedRelation: "cp_problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cp_submissions_user_id_fkey"
            columns: ["user_id"]
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          locale: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          locale?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          locale?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rally_post_assignments: {
        Row: {
          created_at: string
          lo_id: string
          post_id: string
        }
        Insert: {
          created_at?: string
          lo_id: string
          post_id: string
        }
        Update: {
          created_at?: string
          lo_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rally_post_assignments_lo_id_fkey"
            columns: ["lo_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rally_post_assignments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "rally_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      rally_posts: {
        Row: {
          allow_draw: boolean
          competition_id: string
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["rally_post_kind"]
          location: string | null
          name: string
          points_draw: number
          points_lose: number
          points_win: number
          updated_at: string
        }
        Insert: {
          allow_draw?: boolean
          competition_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["rally_post_kind"]
          location?: string | null
          name: string
          points_draw?: number
          points_lose?: number
          points_win?: number
          updated_at?: string
        }
        Update: {
          allow_draw?: boolean
          competition_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["rally_post_kind"]
          location?: string | null
          name?: string
          points_draw?: number
          points_lose?: number
          points_win?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rally_posts_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_events_registration_id_fkey"
            columns: ["registration_id"]
            referencedRelation: "registration_overview"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registration_events_registration_id_fkey"
            columns: ["registration_id"]
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
          twibbon_proof_format: string | null
          twibbon_proof_public_id: string | null
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
          twibbon_proof_format?: string | null
          twibbon_proof_public_id?: string | null
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
          twibbon_proof_format?: string | null
          twibbon_proof_public_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_members_registration_fkey"
            columns: ["registration_id", "competition_id"]
            referencedRelation: "registration_overview"
            referencedColumns: ["id", "competition_id"]
          },
          {
            foreignKeyName: "registration_members_registration_fkey"
            columns: ["registration_id", "competition_id"]
            referencedRelation: "registrations"
            referencedColumns: ["id", "competition_id"]
          },
          {
            foreignKeyName: "registration_members_user_id_fkey"
            columns: ["user_id"]
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
          line_id: string | null
          school: string | null
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
          line_id?: string | null
          school?: string | null
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
          line_id?: string | null
          school?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_leader_id_fkey"
            columns: ["leader_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          about_body_en: string
          about_body_id: string
          about_title_en: string
          about_title_id: string
          id: boolean
          updated_at: string
        }
        Insert: {
          about_body_en?: string
          about_body_id?: string
          about_title_en?: string
          about_title_id?: string
          id?: boolean
          updated_at?: string
        }
        Update: {
          about_body_en?: string
          about_body_id?: string
          about_title_en?: string
          about_title_id?: string
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string
          description_en: string
          description_id: string
          ends_on: string | null
          id: string
          starts_on: string
          title_en: string
          title_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_id?: string
          ends_on?: string | null
          id?: string
          starts_on: string
          title_en: string
          title_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string
          description_id?: string
          ends_on?: string | null
          id?: string
          starts_on?: string
          title_en?: string
          title_id?: string
          updated_at?: string
        }
        Relationships: []
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
          line_id: string | null
          member_count: number | null
          payment_proof_public_id: string | null
          payment_submitted_at: string | null
          referral_code: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          school: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          team_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
            referencedRelation: "competition_stats"
            referencedColumns: ["competition_id"]
          },
          {
            foreignKeyName: "registrations_competition_id_fkey"
            columns: ["competition_id"]
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
      cp_finish_if_time_up: {
        Args: { p_competition_id: string }
        Returns: boolean
      }
      create_registration: {
        Args: {
          p_competition_id: string
          p_leader_name: string
          p_leader_nisn: string
          p_leader_phone: string
          p_line_id: string
          p_payment_proof_format: string
          p_payment_proof_public_id: string
          p_school: string
          p_team_name: string
          p_twibbon_proof_format?: string
          p_twibbon_proof_public_id?: string
        }
        Returns: string
      }
      join_team: {
        Args: {
          p_full_name: string
          p_nisn: string
          p_phone?: string
          p_referral_code: string
          p_twibbon_proof_format?: string
          p_twibbon_proof_public_id?: string
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
          twibbon_url: string
        }[]
      }
    }
    Enums: {
      competition_type: "competitive_programming" | "logic"
      cp_difficulty: "easy" | "medium" | "hard"
      cp_language: "python" | "cpp" | "java"
      cp_session_status: "scheduled" | "live" | "paused" | "ended"
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
      payment_method: "qris" | "bank_transfer"
      rally_post_kind: "physical" | "digital"
      registration_status:
        | "pending_payment"
        | "under_review"
        | "accepted"
        | "rejected"
      user_role: "participant" | "admin" | "lo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
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
  graphql_public: {
    Enums: {},
  },
  pgbouncer: {
    Enums: {},
  },
  private: {
    Enums: {},
  },
  public: {
    Enums: {
      competition_type: ["competitive_programming", "logic"],
      cp_difficulty: ["easy", "medium", "hard"],
      cp_language: ["python", "cpp", "java"],
      cp_session_status: ["scheduled", "live", "paused", "ended"],
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
      payment_method: ["qris", "bank_transfer"],
      rally_post_kind: ["physical", "digital"],
      registration_status: [
        "pending_payment",
        "under_review",
        "accepted",
        "rejected",
      ],
      user_role: ["participant", "admin", "lo"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

