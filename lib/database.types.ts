export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          cost: number
          billing_cycle: string
          next_billing_date: string
          status: string
          category: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          cost: number
          billing_cycle: string
          next_billing_date: string
          status?: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          cost?: number
          billing_cycle?: string
          next_billing_date?: string
          status?: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plaid_accounts: {
        Row: {
          id: string
          user_id: string
          access_token: string
          item_id: string
          account_id: string
          account_name: string
          account_type: string
          account_subtype: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          access_token: string
          item_id: string
          account_id: string
          account_name: string
          account_type: string
          account_subtype?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          access_token?: string
          item_id?: string
          account_id?: string
          account_name?: string
          account_type?: string
          account_subtype?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plaid_transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          transaction_id: string
          amount: number
          date: string
          name: string
          merchant_name: string | null
          category: string[] | null
          is_subscription: boolean
          subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          transaction_id: string
          amount: number
          date: string
          name: string
          merchant_name?: string | null
          category?: string[] | null
          is_subscription?: boolean
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          transaction_id?: string
          amount?: number
          date?: string
          name?: string
          merchant_name?: string | null
          category?: string[] | null
          is_subscription?: boolean
          subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
