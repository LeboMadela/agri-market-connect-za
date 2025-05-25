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
      buyer_profiles: {
        Row: {
          contact_email: string | null
          created_at: string | null
          id: string
          location: string | null
          organization: string | null
          phone: string | null
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          organization?: string | null
          phone?: string | null
          user_id: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          organization?: string | null
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_requests: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          crop_name: string
          id: string
          location: string | null
          notes: string | null
          preferred_price: number | null
          preferred_quantity: number | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          crop_name: string
          id?: string
          location?: string | null
          notes?: string | null
          preferred_price?: number | null
          preferred_quantity?: number | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          crop_name?: string
          id?: string
          location?: string | null
          notes?: string | null
          preferred_price?: number | null
          preferred_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          produce_id: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          produce_id?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          produce_id?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_produce_id_fkey"
            columns: ["produce_id"]
            isOneToOne: false
            referencedRelation: "produce_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          commodity: string | null
          date_updated: string | null
          id: string
          location: string | null
          price_per_kg: number | null
        }
        Insert: {
          commodity?: string | null
          date_updated?: string | null
          id?: string
          location?: string | null
          price_per_kg?: number | null
        }
        Update: {
          commodity?: string | null
          date_updated?: string | null
          id?: string
          location?: string | null
          price_per_kg?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string | null
          data: Json | null
          id: string
          seen: boolean | null
          title: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          channel: string
          created_at?: string | null
          data?: Json | null
          id?: string
          seen?: boolean | null
          title?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          seen?: boolean | null
          title?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produce_listings: {
        Row: {
          commodity: string
          date_posted: string
          farmer_contact: string
          farmer_id: string
          id: string
          location: string
          price_per_kg: number
          quantity_kg: number
        }
        Insert: {
          commodity: string
          date_posted?: string
          farmer_contact: string
          farmer_id: string
          id?: string
          location: string
          price_per_kg: number
          quantity_kg: number
        }
        Update: {
          commodity?: string
          date_posted?: string
          farmer_contact?: string
          farmer_id?: string
          id?: string
          location?: string
          price_per_kg?: number
          quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "produce_listings_farmer_id_fkey"
            columns: ["farmer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
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
      user_role: "farmer" | "buyer"
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
    Enums: {
      user_role: ["farmer", "buyer"],
    },
  },
} as const
