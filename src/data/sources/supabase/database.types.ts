// Gerado a partir do schema real do projeto Supabase `fincouples`
// (mcp: generate_typescript_types). Não editar à mão — regerar quando o
// schema mudar.

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      cartoes: {
        Row: {
          ativo: boolean
          casal_id: string
          created_at: string
          fatura_atual: number
          fechamento: number
          icone: string | null
          id: string
          limite: number
          limite_disponivel: number | null
          nome: string
          proprietario_id: string | null
          tipo: string | null
          vencimento: number
        }
        Insert: {
          ativo?: boolean
          casal_id: string
          created_at?: string
          fatura_atual?: number
          fechamento: number
          icone?: string | null
          id?: string
          limite: number
          limite_disponivel?: number | null
          nome: string
          proprietario_id?: string | null
          tipo?: string | null
          vencimento: number
        }
        Update: {
          ativo?: boolean
          casal_id?: string
          created_at?: string
          fatura_atual?: number
          fechamento?: number
          icone?: string | null
          id?: string
          limite?: number
          limite_disponivel?: number | null
          nome?: string
          proprietario_id?: string | null
          tipo?: string | null
          vencimento?: number
        }
        Relationships: [
          {
            foreignKeyName: "cartoes_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      casais: {
        Row: {
          convite_expira_em: string | null
          convite_token: string | null
          created_at: string
          id: string
          usuario1_id: string
          usuario2_id: string | null
        }
        Insert: {
          convite_expira_em?: string | null
          convite_token?: string | null
          created_at?: string
          id?: string
          usuario1_id: string
          usuario2_id?: string | null
        }
        Update: {
          convite_expira_em?: string | null
          convite_token?: string | null
          created_at?: string
          id?: string
          usuario1_id?: string
          usuario2_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          casal_id: string
          cor: string | null
          created_at: string
          icone: string | null
          id: string
          nome: string
          padrao: boolean
          tipo: string
        }
        Insert: {
          casal_id: string
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          padrao?: boolean
          tipo: string
        }
        Update: {
          casal_id?: string
          cor?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          padrao?: boolean
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      contas: {
        Row: {
          ativa: boolean
          casal_id: string
          created_at: string
          icone: string | null
          id: string
          nome: string
          proprietario_id: string | null
          saldo: number
          tipo: string
        }
        Insert: {
          ativa?: boolean
          casal_id: string
          created_at?: string
          icone?: string | null
          id?: string
          nome: string
          proprietario_id?: string | null
          saldo?: number
          tipo: string
        }
        Update: {
          ativa?: boolean
          casal_id?: string
          created_at?: string
          icone?: string | null
          id?: string
          nome?: string
          proprietario_id?: string | null
          saldo?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          cartao_id: string
          created_at: string
          data_fechamento: string
          data_vencimento: string
          id: string
          mes_referencia: string
          status: string
          valor_pago: number
          valor_total: number
        }
        Insert: {
          cartao_id: string
          created_at?: string
          data_fechamento: string
          data_vencimento: string
          id?: string
          mes_referencia: string
          status?: string
          valor_pago?: number
          valor_total?: number
        }
        Update: {
          cartao_id?: string
          created_at?: string
          data_fechamento?: string
          data_vencimento?: string
          id?: string
          mes_referencia?: string
          status?: string
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          cartao_id: string | null
          casal_id: string
          categoria_id: string
          conta_id: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          lancamento_pai_id: string | null
          pago: boolean
          parcela_atual: number | null
          parcelado: boolean
          pessoa_id: string | null
          tipo: string
          total_parcelas: number | null
          valor: number
        }
        Insert: {
          cartao_id?: string | null
          casal_id: string
          categoria_id: string
          conta_id?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          lancamento_pai_id?: string | null
          pago?: boolean
          parcela_atual?: number | null
          parcelado?: boolean
          pessoa_id?: string | null
          tipo: string
          total_parcelas?: number | null
          valor: number
        }
        Update: {
          cartao_id?: string | null
          casal_id?: string
          categoria_id?: string
          conta_id?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          lancamento_pai_id?: string | null
          pago?: boolean
          parcela_atual?: number | null
          parcelado?: boolean
          pessoa_id?: string | null
          tipo?: string
          total_parcelas?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_lancamento_pai_id_fkey"
            columns: ["lancamento_pai_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          casal_id: string
          categoria_id: string | null
          concluida: boolean
          created_at: string
          id: string
          mes_referencia: string | null
          prazo: string | null
          titulo: string
          valor_atual: number
          valor_objetivo: number
        }
        Insert: {
          casal_id: string
          categoria_id?: string | null
          concluida?: boolean
          created_at?: string
          id?: string
          mes_referencia?: string | null
          prazo?: string | null
          titulo: string
          valor_atual?: number
          valor_objetivo: number
        }
        Update: {
          casal_id?: string
          categoria_id?: string | null
          concluida?: boolean
          created_at?: string
          id?: string
          mes_referencia?: string | null
          prazo?: string | null
          titulo?: string
          valor_atual?: number
          valor_objetivo?: number
        }
        Relationships: [
          {
            foreignKeyName: "metas_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          casal_id: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          casal_id: string
          created_at?: string
          id: string
          nome: string
        }
        Update: {
          casal_id?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfis_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_convite: {
        Args: { p_nome: string; p_token: string }
        Returns: {
          convite_expira_em: string | null
          convite_token: string | null
          created_at: string
          id: string
          usuario1_id: string
          usuario2_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "casais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      criar_casal: {
        Args: { p_nome: string }
        Returns: {
          convite_expira_em: string | null
          convite_token: string | null
          created_at: string
          id: string
          usuario1_id: string
          usuario2_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "casais"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      regenerar_convite: {
        Args: never
        Returns: {
          convite_expira_em: string | null
          convite_token: string | null
          created_at: string
          id: string
          usuario1_id: string
          usuario2_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "casais"
          isOneToOne: true
          isSetofReturn: false
        }
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
