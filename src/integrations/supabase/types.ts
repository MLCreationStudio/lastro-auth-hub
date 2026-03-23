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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cac_benchmark: {
        Row: {
          cac_max: number | null
          cac_min: number | null
          canal_principal: string[] | null
          ciclo_max_dias: number | null
          ciclo_min_dias: number | null
          confianca: string | null
          cpl_max: number | null
          cpl_min: number | null
          id: string
          nicho: string
          subnicho: string | null
          updated_at: string | null
        }
        Insert: {
          cac_max?: number | null
          cac_min?: number | null
          canal_principal?: string[] | null
          ciclo_max_dias?: number | null
          ciclo_min_dias?: number | null
          confianca?: string | null
          cpl_max?: number | null
          cpl_min?: number | null
          id?: string
          nicho: string
          subnicho?: string | null
          updated_at?: string | null
        }
        Update: {
          cac_max?: number | null
          cac_min?: number | null
          canal_principal?: string[] | null
          ciclo_max_dias?: number | null
          ciclo_min_dias?: number | null
          confianca?: string | null
          cpl_max?: number | null
          cpl_min?: number | null
          id?: string
          nicho?: string
          subnicho?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diagnostico: {
        Row: {
          budget_midia: number | null
          budget_total: number | null
          cac_estimado: number | null
          cac_real: number | null
          canais_bloqueados: Json | null
          canais_recomendados: Json | null
          canais_testados: Json | null
          categoria: string | null
          clientes_pagando: boolean | null
          complementares_usados: number
          concorrentes_desc: string | null
          created_at: string | null
          diferencial_score: number | null
          etapa_atual: number | null
          foco_geografico: string | null
          historico_marketing: string | null
          icp_desc: string | null
          icp_score: number | null
          id: string
          lastro_score: number | null
          lastro_score_atualizado: number | null
          meta_clientes: number | null
          metricas_acompanhamento: Json | null
          modelo_cobranca: string | null
          modelo_negocio: string | null
          nicho: string | null
          plano_90_dias: Json | null
          prazo_esperado: number | null
          produto_desc: string | null
          status_plano: string | null
          subnicho: string | null
          tem_historico: boolean | null
          ticket_medio: number | null
          updated_at: string | null
          user_id: string | null
          zona: string | null
        }
        Insert: {
          budget_midia?: number | null
          budget_total?: number | null
          cac_estimado?: number | null
          cac_real?: number | null
          canais_bloqueados?: Json | null
          canais_recomendados?: Json | null
          canais_testados?: Json | null
          categoria?: string | null
          clientes_pagando?: boolean | null
          complementares_usados?: number
          concorrentes_desc?: string | null
          created_at?: string | null
          diferencial_score?: number | null
          etapa_atual?: number | null
          foco_geografico?: string | null
          historico_marketing?: string | null
          icp_desc?: string | null
          icp_score?: number | null
          id?: string
          lastro_score?: number | null
          lastro_score_atualizado?: number | null
          meta_clientes?: number | null
          metricas_acompanhamento?: Json | null
          modelo_cobranca?: string | null
          modelo_negocio?: string | null
          nicho?: string | null
          plano_90_dias?: Json | null
          prazo_esperado?: number | null
          produto_desc?: string | null
          status_plano?: string | null
          subnicho?: string | null
          tem_historico?: boolean | null
          ticket_medio?: number | null
          updated_at?: string | null
          user_id?: string | null
          zona?: string | null
        }
        Update: {
          budget_midia?: number | null
          budget_total?: number | null
          cac_estimado?: number | null
          cac_real?: number | null
          canais_bloqueados?: Json | null
          canais_recomendados?: Json | null
          canais_testados?: Json | null
          categoria?: string | null
          clientes_pagando?: boolean | null
          complementares_usados?: number
          concorrentes_desc?: string | null
          created_at?: string | null
          diferencial_score?: number | null
          etapa_atual?: number | null
          foco_geografico?: string | null
          historico_marketing?: string | null
          icp_desc?: string | null
          icp_score?: number | null
          id?: string
          lastro_score?: number | null
          lastro_score_atualizado?: number | null
          meta_clientes?: number | null
          metricas_acompanhamento?: Json | null
          modelo_cobranca?: string | null
          modelo_negocio?: string | null
          nicho?: string | null
          plano_90_dias?: Json | null
          prazo_esperado?: number | null
          produto_desc?: string | null
          status_plano?: string | null
          subnicho?: string | null
          tem_historico?: boolean | null
          ticket_medio?: number | null
          updated_at?: string | null
          user_id?: string | null
          zona?: string | null
        }
        Relationships: []
      }
      resultado_semanal: {
        Row: {
          cac_emergente: number | null
          causa_desvio: string | null
          created_at: string | null
          diagnostico_id: string | null
          id: string
          investimento_real: number | null
          resultado_real: number | null
          semana: number
          status: string | null
          user_id: string | null
        }
        Insert: {
          cac_emergente?: number | null
          causa_desvio?: string | null
          created_at?: string | null
          diagnostico_id?: string | null
          id?: string
          investimento_real?: number | null
          resultado_real?: number | null
          semana: number
          status?: string | null
          user_id?: string | null
        }
        Update: {
          cac_emergente?: number | null
          causa_desvio?: string | null
          created_at?: string | null
          diagnostico_id?: string | null
          id?: string
          investimento_real?: number | null
          resultado_real?: number | null
          semana?: number
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resultado_semanal_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnostico"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
