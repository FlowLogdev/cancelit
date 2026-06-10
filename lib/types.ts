export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

export interface Subscription {
  id: string
  user_id: string
  name: string
  amount: number
  billing_cycle: "monthly" | "yearly" | "weekly"
  next_billing_date: string
  status: "active" | "cancelled" | "paused"
  category?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionFormData {
  name: string
  amount: number
  billing_cycle: "monthly" | "yearly" | "weekly"
  next_billing_date: string
  category: string
}

export interface SubscriptionStats {
  totalMonthly: number
  totalYearly: number
  activeCount: number
  totalSpent: number
}

export interface CreateSubscriptionData {
  name: string
  amount: number
  billing_cycle: "monthly" | "yearly" | "weekly"
  category: string
  next_billing_date: string
}

export interface UpdateSubscriptionData {
  name?: string
  amount?: number
  billing_cycle?: "monthly" | "yearly" | "weekly"
  category?: string
  next_billing_date?: string
}

export interface AuthResponse {
  error?: string
  user?: User
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: User
        Insert: Omit<User, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<User, "id">>
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Subscription, "id">>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      billing_cycle: "monthly" | "yearly" | "weekly"
      subscription_status: "active" | "cancelled" | "paused"
    }
  }
}

export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"]
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]
