"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function DebugAuth() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testPassword, setTestPassword] = useState("password123")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      toast({
        title: "Sign up successful",
        description: data.user ? "Check your email for confirmation" : "Something went wrong",
      })

      console.log("Sign up response:", data)
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
      console.error("Sign up error:", error)
    }
  }

  const handleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (error) throw error

      toast({
        title: "Sign in successful",
        description: "You are now logged in",
      })

      console.log("Sign in response:", data)
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
      console.error("Sign in error:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) throw error

      toast({
        title: "Sign out successful",
        description: "You have been logged out",
      })
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      })
      console.error("Sign out error:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Debugging</CardTitle>
        <CardDescription>Test Supabase authentication connection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="font-medium">Test Credentials</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email"
              className="border p-2 rounded"
            />
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Password"
              className="border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleSignUp}>Test Sign Up</Button>
          <Button onClick={handleSignIn}>Test Sign In</Button>
          <Button onClick={handleSignOut} variant="destructive">
            Test Sign Out
          </Button>
        </div>

        <div className="border p-4 rounded bg-gray-50 overflow-auto max-h-60">
          <div className="font-medium mb-2">Session Status:</div>
          {loading ? (
            <div>Loading session...</div>
          ) : session ? (
            <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>
          ) : (
            <div>No active session</div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          <p>Environment Variables:</p>
          <ul className="list-disc pl-5">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</li>
            <li>
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
