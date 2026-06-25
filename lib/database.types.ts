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
          avatar_url: string | null
          phone: string | null
          billing_address: Json | null
          payment_method: Json | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string | null
          subscription_status: string
          email_confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          subscription_status?: string
          email_confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          billing_address?: Json | null
          payment_method?: Json | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string | null
          subscription_status?: string
          email_confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number | null
          cost: number | null
          billing_cycle: string
          next_billing_date: string
          status: string
          category: string | null
          description: string | null
          website_url: string | null
          logo_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount?: number | null
          cost?: number | null
          billing_cycle: string
          next_billing_date: string
          status?: string
          category?: string | null
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number | null
          cost?: number | null
          billing_cycle?: string
          next_billing_date?: string
          status?: string
          category?: string | null
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plaid_items: {
        Row: {
          id: string
          user_id: string
          item_id: string
          access_token: string
          institution_id: string | null
          institution_name: string | null
          status: string
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          access_token: string
          institution_id?: string | null
          institution_name?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          access_token?: string
          institution_id?: string | null
          institution_name?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plaid_accounts: {
        Row: {
          id: string
          user_id: string
          item_id: string
          account_id: string
          account_name: string | null
          account_mask: string | null
          account_type: string | null
          account_subtype: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          account_id: string
          account_name?: string | null
          account_mask?: string | null
          account_type?: string | null
          account_subtype?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          account_id?: string
          account_name?: string | null
          account_mask?: string | null
          account_type?: string | null
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
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
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
