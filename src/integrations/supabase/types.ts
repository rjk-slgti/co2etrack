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
      activity_entries: {
        Row: {
          activity_type: string
          category: string
          converted_quantity: number | null
          converted_unit: string | null
          created_at: string
          data_quality: string | null
          emission_ch4: number | null
          emission_co2: number | null
          emission_kgco2e: number | null
          emission_n2o: number | null
          entry_date: string
          factor_id: string | null
          factor_value_id: string | null
          id: string
          is_assumed_factor: boolean | null
          location_based_emission: number | null
          market_based_emission: number | null
          notes: string | null
          organization_id: string
          quantity: number
          reporting_period_id: string | null
          scope: string
          scope_category: string | null
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: string
          category: string
          converted_quantity?: number | null
          converted_unit?: string | null
          created_at?: string
          data_quality?: string | null
          emission_ch4?: number | null
          emission_co2?: number | null
          emission_kgco2e?: number | null
          emission_n2o?: number | null
          entry_date?: string
          factor_id?: string | null
          factor_value_id?: string | null
          id?: string
          is_assumed_factor?: boolean | null
          location_based_emission?: number | null
          market_based_emission?: number | null
          notes?: string | null
          organization_id: string
          quantity: number
          reporting_period_id?: string | null
          scope: string
          scope_category?: string | null
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          category?: string
          converted_quantity?: number | null
          converted_unit?: string | null
          created_at?: string
          data_quality?: string | null
          emission_ch4?: number | null
          emission_co2?: number | null
          emission_kgco2e?: number | null
          emission_n2o?: number | null
          entry_date?: string
          factor_id?: string | null
          factor_value_id?: string | null
          id?: string
          is_assumed_factor?: boolean | null
          location_based_emission?: number | null
          market_based_emission?: number | null
          notes?: string | null
          organization_id?: string
          quantity?: number
          reporting_period_id?: string | null
          scope?: string
          scope_category?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_entries_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factor_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_entries_factor_value_id_fkey"
            columns: ["factor_value_id"]
            isOneToOne: false
            referencedRelation: "emission_factor_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_entries_reporting_period_id_fkey"
            columns: ["reporting_period_id"]
            isOneToOne: false
            referencedRelation: "reporting_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          activity_entry_id: string | null
          created_at: string
          details: Json | null
          factor_id: string | null
          factor_source: string | null
          factor_version: string | null
          gwp_set: string | null
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          activity_entry_id?: string | null
          created_at?: string
          details?: Json | null
          factor_id?: string | null
          factor_source?: string | null
          factor_version?: string | null
          gwp_set?: string | null
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          activity_entry_id?: string | null
          created_at?: string
          details?: Json | null
          factor_id?: string | null
          factor_source?: string | null
          factor_version?: string | null
          gwp_set?: string | null
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_activity_entry_id_fkey"
            columns: ["activity_entry_id"]
            isOneToOne: false
            referencedRelation: "activity_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      country_overrides: {
        Row: {
          created_at: string
          grid_factor_location_based: number | null
          grid_factor_market_based: number | null
          id: string
          notes: string | null
          region: string
          source: string | null
          valid_year: number
        }
        Insert: {
          created_at?: string
          grid_factor_location_based?: number | null
          grid_factor_market_based?: number | null
          id?: string
          notes?: string | null
          region: string
          source?: string | null
          valid_year: number
        }
        Update: {
          created_at?: string
          grid_factor_location_based?: number | null
          grid_factor_market_based?: number | null
          id?: string
          notes?: string | null
          region?: string
          source?: string | null
          valid_year?: number
        }
        Relationships: []
      }
      emission_factor_headers: {
        Row: {
          activity_type: string
          category: string
          created_at: string
          id: string
          is_locked: boolean
          last_updated: string
          methodology_note: string | null
          region: string
          source: string
          source_reference: string | null
          source_version: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          activity_type: string
          category: string
          created_at?: string
          id?: string
          is_locked?: boolean
          last_updated?: string
          methodology_note?: string | null
          region?: string
          source: string
          source_reference?: string | null
          source_version?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          activity_type?: string
          category?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          last_updated?: string
          methodology_note?: string | null
          region?: string
          source?: string
          source_reference?: string | null
          source_version?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: []
      }
      emission_factor_values: {
        Row: {
          ch4_fraction: number | null
          co2_fraction: number | null
          created_at: string
          data_quality: string
          emission_factor: number
          emission_type: string
          factor_id: string
          gwp_set: string
          id: string
          n2o_fraction: number | null
          uncertainty_percent: number | null
          unit_input: string
          unit_standard: string
        }
        Insert: {
          ch4_fraction?: number | null
          co2_fraction?: number | null
          created_at?: string
          data_quality?: string
          emission_factor: number
          emission_type: string
          factor_id: string
          gwp_set?: string
          id?: string
          n2o_fraction?: number | null
          uncertainty_percent?: number | null
          unit_input: string
          unit_standard: string
        }
        Update: {
          ch4_fraction?: number | null
          co2_fraction?: number | null
          created_at?: string
          data_quality?: string
          emission_factor?: number
          emission_type?: string
          factor_id?: string
          gwp_set?: string
          id?: string
          n2o_fraction?: number | null
          uncertainty_percent?: number | null
          unit_input?: string
          unit_standard?: string
        }
        Relationships: [
          {
            foreignKeyName: "emission_factor_values_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "emission_factor_headers"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country: string
          created_at: string
          id: string
          industry: string | null
          name: string
          reporting_currency: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          industry?: string | null
          name: string
          reporting_currency?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          industry?: string | null
          name?: string
          reporting_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      reporting_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          organization_id: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          organization_id: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          organization_id?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporting_periods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_conversions: {
        Row: {
          category: string | null
          conversion_factor: number
          created_at: string
          from_unit: string
          id: string
          to_unit: string
        }
        Insert: {
          category?: string | null
          conversion_factor: number
          created_at?: string
          from_unit: string
          id?: string
          to_unit: string
        }
        Update: {
          category?: string | null
          conversion_factor?: number
          created_at?: string
          from_unit?: string
          id?: string
          to_unit?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "auditor" | "data_entry"
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
      app_role: ["admin", "auditor", "data_entry"],
    },
  },
} as const
