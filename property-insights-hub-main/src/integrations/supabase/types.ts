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
      bairro_base_m2: {
        Row: {
          bairro: string
          cidade: string
          created_at: string | null
          id: string
          updated_at: string | null
          valor_m2_base: number
        }
        Insert: {
          bairro: string
          cidade: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor_m2_base: number
        }
        Update: {
          bairro?: string
          cidade?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          valor_m2_base?: number
        }
        Relationships: []
      }
      db_health_reports: {
        Row: {
          created_at: string | null
          id: string
          idx_scan: number | null
          index_sql: string | null
          n_live_tup: number | null
          recommendation: string | null
          seq_scan: number | null
          status: string | null
          table_name: string | null
          table_schema: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          idx_scan?: number | null
          index_sql?: string | null
          n_live_tup?: number | null
          recommendation?: string | null
          seq_scan?: number | null
          status?: string | null
          table_name?: string | null
          table_schema?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idx_scan?: number | null
          index_sql?: string | null
          n_live_tup?: number | null
          recommendation?: string | null
          seq_scan?: number | null
          status?: string | null
          table_name?: string | null
          table_schema?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          bairro: string | null
          cidade: string | null
          created_at: string | null
          data_coleta: string | null
          fonte: string | null
          id: string
          metragem: number | null
          tipo: string | null
          valor_anunciado: number | null
          valor_m2: number | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          data_coleta?: string | null
          fonte?: string | null
          id?: string
          metragem?: number | null
          tipo?: string | null
          valor_anunciado?: number | null
          valor_m2?: number | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          data_coleta?: string | null
          fonte?: string | null
          id?: string
          metragem?: number | null
          tipo?: string | null
          valor_anunciado?: number | null
          valor_m2?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          creci: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          plano: string | null
          role: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creci?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          plano?: string | null
          role?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creci?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          plano?: string | null
          role?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      property_valuations: {
        Row: {
          bairro: string | null
          cidade: string | null
          created_at: string | null
          endereco: string | null
          estrategia: string | null
          faixa_max: number | null
          faixa_min: number | null
          id: string
          metragem: number | null
          padrao: string | null
          preco_calculado: number | null
          quartos: number | null
          tempo_estimado: number | null
          tipo: string | null
          user_id: string | null
          vagas: number | null
          valor_base_m2: number | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estrategia?: string | null
          faixa_max?: number | null
          faixa_min?: number | null
          id?: string
          metragem?: number | null
          padrao?: string | null
          preco_calculado?: number | null
          quartos?: number | null
          tempo_estimado?: number | null
          tipo?: string | null
          user_id?: string | null
          vagas?: number | null
          valor_base_m2?: number | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estrategia?: string | null
          faixa_max?: number | null
          faixa_min?: number | null
          id?: string
          metragem?: number | null
          padrao?: string | null
          preco_calculado?: number | null
          quartos?: number | null
          tempo_estimado?: number | null
          tipo?: string | null
          user_id?: string | null
          vagas?: number | null
          valor_base_m2?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_valuations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_valuations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          pdf_url: string | null
          user_id: string | null
          valuation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          user_id?: string | null
          valuation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pdf_url?: string | null
          user_id?: string | null
          valuation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_valuation_id_fkey"
            columns: ["valuation_id"]
            isOneToOne: false
            referencedRelation: "property_valuations"
            referencedColumns: ["id"]
          },
        ]
      }
      sold_properties: {
        Row: {
          bairro: string | null
          cidade: string | null
          created_at: string | null
          id: string
          metragem: number | null
          padrao: string | null
          quartos: number | null
          tempo_ate_venda_dias: number | null
          tipo: string | null
          user_id: string | null
          vagas: number | null
          valor_anunciado: number | null
          valor_vendido: number | null
        }
        Insert: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          id?: string
          metragem?: number | null
          padrao?: string | null
          quartos?: number | null
          tempo_ate_venda_dias?: number | null
          tipo?: string | null
          user_id?: string | null
          vagas?: number | null
          valor_anunciado?: number | null
          valor_vendido?: number | null
        }
        Update: {
          bairro?: string | null
          cidade?: string | null
          created_at?: string | null
          id?: string
          metragem?: number | null
          padrao?: string | null
          quartos?: number | null
          tempo_ate_venda_dias?: number | null
          tipo?: string | null
          user_id?: string | null
          vagas?: number | null
          valor_anunciado?: number | null
          valor_vendido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sold_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sold_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          id: string
          plano: string
          status: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          id?: string
          plano: string
          status?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: string
          plano?: string
          status?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_control: {
        Row: {
          created_at: string | null
          id: string
          mes_referencia: string
          precificacoes_utilizadas: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mes_referencia: string
          precificacoes_utilizadas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mes_referencia?: string
          precificacoes_utilizadas?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_control_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_control_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users_view: {
        Row: {
          created_at: string | null
          creci: string | null
          id: string | null
          is_admin: boolean | null
          mes_referencia: string | null
          nome: string | null
          plano: string | null
          status: string | null
          uso_mes_atual: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_plano: {
        Args: { p_novo_plano: string; p_user_id: string }
        Returns: undefined
      }
      admin_update_status: {
        Args: { p_novo_status: string; p_user_id: string }
        Returns: undefined
      }
      calculate_property_price: {
        Args: {
          area: number
          base_price: number
          condition: string
          location: string
          property_id: string
          property_type: string
          rooms: number
          status: string
        }
        Returns: number
      }
      check_user_monthly_limit: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      execute_index: { Args: { sql_command: string }; Returns: undefined }
      get_all_functions: {
        Args: never
        Returns: {
          definition: string
          name: string
        }[]
      }
      get_all_tables: {
        Args: never
        Returns: {
          name: string
        }[]
      }
      get_all_triggers: {
        Args: never
        Returns: {
          definition: string
          name: string
          table_name: string
        }[]
      }
      get_seqscan_heavy: {
        Args: never
        Returns: {
          idx_scan: number
          n_live_tup: number
          seq_scan: number
          table_name: string
          table_schema: string
        }[]
      }
      get_table_sizes: {
        Args: never
        Returns: {
          table_name: string
          table_schema: string
          total_size: string
          total_size_bytes: number
        }[]
      }
      get_valor_m2_medio:
        | { Args: { p_bairro: string }; Returns: number }
        | { Args: { p_bairro: string; p_cidade: string }; Returns: number }
      is_profile_complete: { Args: { p_user_id: string }; Returns: boolean }
      teste_auth: { Args: never; Returns: string }
      teste_supabase: { Args: never; Returns: string }
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
    Enums: {},
  },
} as const
