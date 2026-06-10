"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "./supabase/client"

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    console.log("\n═══════════════════════════════════════")
    console.log("🔵 SIGNUP ATTEMPT STARTED")
    console.log("═══════════════════════════════════════")
    console.log("📧 Email:", email)
    console.log("👤 Full Name:", fullName)
    console.log("🔐 Password Length:", password.length)
    console.log("⏰ Timestamp:", new Date().toISOString())
    console.log("\n📤 Calling signUp...\n")

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    console.log("\n📊 [AUTH-CONTEXT] Supabase Response:")
    console.log("═══════════════════════════════════════")
    console.log("Has Error:", !!error)
    if (error) {
      console.log("❌ Error Message:", error.message)
      console.log("❌ Error Status:", error.status)
      console.log("❌ Error Code:", error.code)
      console.log("❌ Error Name:", error.name)
      console.log("❌ Full Error:", error)
      throw error
    }
    console.log("Has User:", !!data?.user)
    console.log("Has Session:", !!data?.session)
    console.log("═══════════════════════════════════════\n")

    if (!data?.user) {
      throw new Error("Signup succeeded but no user was returned")
    }

    console.log("✅ [AUTH-CONTEXT] Signup successful!")
    console.log("User ID:", data.user?.id)
    console.log("Email:", data.user?.email)
    console.log("\n")
  }

  const signInWithEmail = async (email: string, password: string) => {
    console.log("\n═══════════════════════════════════════")
    console.log("🔵 SIGNIN ATTEMPT STARTED")
    console.log("═══════════════════════════════════════")
    console.log("📧 Email:", email)
    console.log("⏰ Timestamp:", new Date().toISOString())
    console.log("\n📤 Calling signInWithPassword...\n")

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("\n📊 [AUTH-CONTEXT] Supabase Response:")
    console.log("═══════════════════════════════════════")
    console.log("Has Error:", !!error)
    if (error) {
      console.log("❌ Error Message:", error.message)
      console.log("❌ Error Status:", error.status)
      console.log("❌ Error Code:", error.code)
      console.log("❌ Error Name:", error.name)
      throw error
    }
    console.log("Has User:", !!data?.user)
    console.log("Has Session:", !!data?.session)
    console.log("═══════════════════════════════════════\n")

    if (!data?.user) {
      throw new Error("Sign in succeeded but no user was returned")
    }

    console.log("✅ [AUTH-CONTEXT] Sign in successful!")
    console.log("User ID:", data.user?.id)
    console.log("Email:", data.user?.email)
    console.log("\n")
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error("Google sign in error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
