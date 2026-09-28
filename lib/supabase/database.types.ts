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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaign_creation_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          progression_mode: string
          requested_by: string
          review_notes: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name: string
          progression_mode?: string
          requested_by: string
          review_notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          progression_mode?: string
          requested_by?: string
          review_notes?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          actor_user_id: string | null
          campaign_id: string
          created_at: string
          detail: string
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          payload: Json
          session_id: string | null
          title: string
        }
        Insert: {
          actor_user_id?: string | null
          campaign_id: string
          created_at?: string
          detail?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          payload?: Json
          session_id?: string | null
          title: string
        }
        Update: {
          actor_user_id?: string | null
          campaign_id?: string
          created_at?: string
          detail?: string
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          payload?: Json
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "campaign_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_invitations: {
        Row: {
          campaign_id: string
          code: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          max_uses: number | null
          uses: number
        }
        Insert: {
          campaign_id: string
          code: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          uses?: number
        }
        Update: {
          campaign_id?: string
          code?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          uses?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_invitations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_members: {
        Row: {
          campaign_id: string
          display_name: string | null
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          display_name?: string | null
          joined_at?: string
          role: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          display_name?: string | null
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_members_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sessions: {
        Row: {
          campaign_id: string
          created_at: string
          created_by: string
          id: string
          notes: string
          played_at: string | null
          session_number: number
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          created_by: string
          id?: string
          notes?: string
          played_at?: string | null
          session_number: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          created_by?: string
          id?: string
          notes?: string
          played_at?: string | null
          session_number?: number
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sessions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          image_url: string | null
          invite_code: string | null
          name: string
          progression_mode: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          id?: string
          image_url?: string | null
          invite_code?: string | null
          name: string
          progression_mode?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          image_url?: string | null
          invite_code?: string | null
          name?: string
          progression_mode?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      captured_pokemon: {
        Row: {
          ability: string
          captured_at: string | null
          character_id: string
          created_at: string
          experience: number
          held_item: string | null
          hp: number
          id: string
          image_url: string | null
          level: number
          max_hp: number
          moves: Json
          nature: string | null
          nickname: string
          notes: string
          sheet_data: Json
          species_id: string | null
          status: string
          types: Json
          updated_at: string
        }
        Insert: {
          ability?: string
          captured_at?: string | null
          character_id: string
          created_at?: string
          experience?: number
          held_item?: string | null
          hp?: number
          id?: string
          image_url?: string | null
          level?: number
          max_hp?: number
          moves?: Json
          nature?: string | null
          nickname?: string
          notes?: string
          sheet_data?: Json
          species_id?: string | null
          status?: string
          types?: Json
          updated_at?: string
        }
        Update: {
          ability?: string
          captured_at?: string | null
          character_id?: string
          created_at?: string
          experience?: number
          held_item?: string | null
          hp?: number
          id?: string
          image_url?: string | null
          level?: number
          max_hp?: number
          moves?: Json
          nature?: string | null
          nickname?: string
          notes?: string
          sheet_data?: Json
          species_id?: string | null
          status?: string
          types?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "captured_pokemon_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "captured_pokemon_species_id_fkey"
            columns: ["species_id"]
            isOneToOne: false
            referencedRelation: "pokemon_species"
            referencedColumns: ["id"]
          },
        ]
      }
      character_inventory: {
        Row: {
          character_id: string
          created_at: string
          custom_name: string | null
          id: string
          item_id: string | null
          metadata: Json
          quantity: number
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          custom_name?: string | null
          id?: string
          item_id?: string | null
          metadata?: Json
          quantity?: number
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          custom_name?: string | null
          id?: string
          item_id?: string | null
          metadata?: Json
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_inventory_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "character_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          abilities: Json
          action_points: number
          attributes: Json
          avatar_url: string | null
          background: string
          campaign_id: string
          capabilities: Json
          classes: Json
          concept: string
          created_at: string
          experience: number
          features: Json
          hp: number
          id: string
          level: number
          max_action_points: number
          max_hp: number
          money: number
          name: string
          notes: string
          stats: Json
          talents: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          abilities?: Json
          action_points?: number
          attributes?: Json
          avatar_url?: string | null
          background?: string
          campaign_id: string
          capabilities?: Json
          classes?: Json
          concept?: string
          created_at?: string
          experience?: number
          features?: Json
          hp?: number
          id?: string
          level?: number
          max_action_points?: number
          max_hp?: number
          money?: number
          name: string
          notes?: string
          stats?: Json
          talents?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          abilities?: Json
          action_points?: number
          attributes?: Json
          avatar_url?: string | null
          background?: string
          campaign_id?: string
          capabilities?: Json
          classes?: Json
          concept?: string
          created_at?: string
          experience?: number
          features?: Json
          hp?: number
          id?: string
          level?: number
          max_action_points?: number
          max_hp?: number
          money?: number
          name?: string
          notes?: string
          stats?: Json
          talents?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_user_id_fkey"
            columns: ["campaign_id", "user_id"]
            isOneToOne: true
            referencedRelation: "campaign_members"
            referencedColumns: ["campaign_id", "user_id"]
          },
        ]
      }
      inventory_events: {
        Row: {
          character_id: string
          created_at: string
          created_by: string
          event_type: string
          id: string
          inventory_id: string | null
          item_id: string | null
          quantity_after: number | null
          quantity_delta: number
          reason: string
          session_id: string | null
        }
        Insert: {
          character_id: string
          created_at?: string
          created_by: string
          event_type: string
          id?: string
          inventory_id?: string | null
          item_id?: string | null
          quantity_after?: number | null
          quantity_delta: number
          reason?: string
          session_id?: string | null
        }
        Update: {
          character_id?: string
          created_at?: string
          created_by?: string
          event_type?: string
          id?: string
          inventory_id?: string | null
          item_id?: string | null
          quantity_after?: number | null
          quantity_delta?: number
          reason?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "character_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "campaign_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          character_id: string
          created_at: string
          id: string
          name: string
          quantity: number
          updated_at: string
        }
        Insert: {
          category?: string
          character_id: string
          created_at?: string
          id?: string
          name: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          category?: string
          character_id?: string
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          image_url: string | null
          name: string
          rules_data: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name: string
          rules_data?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          rules_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      pokemon: {
        Row: {
          ability: string
          character_id: string
          created_at: string
          hp: number
          id: string
          image_url: string | null
          level: number
          max_hp: number
          moves: Json
          name: string
          nature: string | null
          species: string
          types: Json
          updated_at: string
        }
        Insert: {
          ability?: string
          character_id: string
          created_at?: string
          hp?: number
          id?: string
          image_url?: string | null
          level?: number
          max_hp?: number
          moves?: Json
          name: string
          nature?: string | null
          species: string
          types?: Json
          updated_at?: string
        }
        Update: {
          ability?: string
          character_id?: string
          created_at?: string
          hp?: number
          id?: string
          image_url?: string | null
          level?: number
          max_hp?: number
          moves?: Json
          name?: string
          nature?: string | null
          species?: string
          types?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pokemon_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      pokemon_species: {
        Row: {
          abilities: Json
          base_stats: Json
          capabilities: Json
          created_at: string
          description: string
          dex_number: number | null
          id: string
          image_url: string | null
          name: string
          rules_data: Json
          types: Json
          updated_at: string
        }
        Insert: {
          abilities?: Json
          base_stats?: Json
          capabilities?: Json
          created_at?: string
          description?: string
          dex_number?: number | null
          id?: string
          image_url?: string | null
          name: string
          rules_data?: Json
          types?: Json
          updated_at?: string
        }
        Update: {
          abilities?: Json
          base_stats?: Json
          capabilities?: Json
          created_at?: string
          description?: string
          dex_number?: number | null
          id?: string
          image_url?: string | null
          name?: string
          rules_data?: Json
          types?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          platform_role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          platform_role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          platform_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_notes: {
        Row: {
          author_user_id: string | null
          content: string
          created_at: string
          id: string
          is_gm_only: boolean
          note_type: string
          session_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_gm_only?: boolean
          note_type?: string
          session_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_gm_only?: boolean
          note_type?: string
          session_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "campaign_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_campaign_creation_request: {
        Args: { request_id_input: string; review_notes_input?: string }
        Returns: Json
      }
      join_campaign_by_invite: {
        Args: { invite_code_input: string }
        Returns: Json
      }
      reject_campaign_creation_request: {
        Args: { request_id_input: string; review_notes_input?: string }
        Returns: Json
      }
      search_platform_users: {
        Args: { search_query?: string }
        Returns: {
          display_name: string
          email: string
          email_confirmed: boolean
          id: string
          platform_role: string
        }[]
      }
      set_platform_admin: {
        Args: { make_admin: boolean; target_user_id: string }
        Returns: boolean
      }
      submit_campaign_creation_request: {
        Args: {
          request_description?: string
          request_image_url?: string
          request_name: string
          request_progression_mode?: string
        }
        Returns: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
