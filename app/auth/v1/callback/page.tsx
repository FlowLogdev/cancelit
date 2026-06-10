"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthV1Callback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback at /auth/v1/callback")

        // Get the session from the URL hash or query params
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Auth callback error:", error)
          router.push("/?error=auth_error")
          return
        }

        if (data.session) {
          console.log("✅ Authentication successful, redirecting to dashboard")
          // User is authenticated, redirect to dashboard
          router.push("/dashboard")
        } else {
          console.log("⚠️ No session found, redirecting to home")
          // No session, redirect to home
          router.push("/")
        }
      } catch (error) {
        console.error("💥 Auth callback error:", error)
        router.push("/?error=auth_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we sign you in.</p>
      </div>
    </div>
  )
}
