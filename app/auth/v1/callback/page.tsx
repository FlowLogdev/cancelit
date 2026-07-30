"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
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
    <div className="flex items-center justify-center min-h-screen bg-black p-4 text-white">
      <div className="text-center">
        <CancelItLogo
          href=""
          className="mx-auto mb-5 justify-center"
          imageClassName="h-14 w-14 rounded-2xl"
          textClassName="text-2xl"
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing authentication...</h2>
        <p className="text-white/50">Please wait while we sign you in.</p>
      </div>
    </div>
  )
}
