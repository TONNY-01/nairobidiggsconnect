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
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          property_id: string | null
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          property_id?: string | null
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          property_id?: string | null
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      move_requests: {
        Row: {
          created_at: string | null
          distance_km: number | null
          dropoff_location: string
          estimated_cost: number | null
          id: string
          move_date: string
          mover_id: string
          notes: string | null
          packing_help: boolean | null
          pickup_location: string
          property_id: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          van_size: string
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          dropoff_location: string
          estimated_cost?: number | null
          id?: string
          move_date: string
          mover_id: string
          notes?: string | null
          packing_help?: boolean | null
          pickup_location: string
          property_id?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          van_size: string
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          dropoff_location?: string
          estimated_cost?: number | null
          id?: string
          move_date?: string
          mover_id?: string
          notes?: string | null
          packing_help?: boolean | null
          pickup_location?: string
          property_id?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          van_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_requests_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mover_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          move_request_id: string | null
          mover_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          move_request_id?: string | null
          mover_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          move_request_id?: string | null
          mover_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mover_reviews_move_request_id_fkey"
            columns: ["move_request_id"]
            isOneToOne: false
            referencedRelation: "move_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mover_reviews_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mover_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mover_services: {
        Row: {
          created_at: string | null
          description: string | null
          fixed_rate: number | null
          hourly_rate: number
          id: string
          mover_id: string
          van_size: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fixed_rate?: number | null
          hourly_rate: number
          id?: string
          mover_id: string
          van_size: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fixed_rate?: number | null
          hourly_rate?: number
          id?: string
          mover_id?: string
          van_size?: string
        }
        Relationships: [
          {
            foreignKeyName: "mover_services_mover_id_fkey"
            columns: ["mover_id"]
            isOneToOne: false
            referencedRelation: "movers"
            referencedColumns: ["id"]
          },
        ]
      }
      movers: {
        Row: {
          avatar_url: string | null
          business_name: string
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          phone: string
          rating: number | null
          service_areas: string[] | null
          total_jobs: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_name: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          phone: string
          rating?: number | null
          service_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          phone?: string
          rating?: number | null
          service_areas?: string[] | null
          total_jobs?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ai_enabled: boolean | null
          avatar_url: string | null
          created_at: string
          full_name: string
          groq_api_key: string | null
          id: string
          phone: string | null
          updated_at: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          ai_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          full_name: string
          groq_api_key?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          ai_enabled?: boolean | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          groq_api_key?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          available_from: string | null
          caretaker_id: string
          created_at: string
          deposit: number | null
          description: string
          id: string
          is_furnished: boolean | null
          location: string
          neighborhood: string | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          rooms: number
          status: string
          title: string
          updated_at: string
          utilities_included: boolean | null
          video_url: string | null
        }
        Insert: {
          amenities?: string[] | null
          available_from?: string | null
          caretaker_id: string
          created_at?: string
          deposit?: number | null
          description: string
          id?: string
          is_furnished?: boolean | null
          location: string
          neighborhood?: string | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          rooms?: number
          status?: string
          title: string
          updated_at?: string
          utilities_included?: boolean | null
          video_url?: string | null
        }
        Update: {
          amenities?: string[] | null
          available_from?: string | null
          caretaker_id?: string
          created_at?: string
          deposit?: number | null
          description?: string
          id?: string
          is_furnished?: boolean | null
          location?: string
          neighborhood?: string | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          rooms?: number
          status?: string
          title?: string
          updated_at?: string
          utilities_included?: boolean | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          property_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          property_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      property_type:
        | "studio"
        | "one_bedroom"
        | "two_bedroom"
        | "three_bedroom_plus"
        | "bedsitter"
      user_role: "tenant" | "caretaker" | "admin" | "mover"
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
      app_role: ["admin", "moderator", "user"],
      property_type: [
        "studio",
        "one_bedroom",
        "two_bedroom",
        "three_bedroom_plus",
        "bedsitter",
      ],
      user_role: ["tenant", "caretaker", "admin", "mover"],
    },
  },
} as const
