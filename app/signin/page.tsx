"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState<"email" | "password" | null>(null)
  const router = useRouter()
  const { signInWithEmail } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldError(null)

    try {
      console.log("🔐 Attempting sign in for:", email)
      await signInWithEmail(email, password)
      console.log("✅ Sign in successful, redirecting to pricing...")
      router.push("/pricing")
    } catch (err) {
      console.error("❌ Sign in error:", err)

      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign in"

      // Determine which field has the error and provide specific feedback
      if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("invalid_credentials")) {
        setError("Invalid email or password. Please check your credentials and try again.")
        setFieldError("password")
      } else if (errorMessage.includes("Email not confirmed") || errorMessage.includes("email_not_confirmed")) {
        setError("Please verify your email address before signing in. Check your inbox for the confirmation email.")
        setFieldError("email")
      } else if (errorMessage.includes("User not found") || errorMessage.includes("user_not_found")) {
        setError("No account found with this email address. Please sign up first.")
        setFieldError("email")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0F0F0F] border-white/[0.08]">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-2xl font-black tracking-tight mb-0.5">
            Cancel<span className="text-red-500">It</span>
          </div>
          <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-white/45">Sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-lg text-sm mb-4 flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                    setFieldError(null)
                  }}
                  className={`pl-10 ${fieldError === "email" ? "border-red-500 focus:ring-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-red-400 hover:text-red-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                    setFieldError(null)
                  }}
                  className={`pl-10 ${fieldError === "password" ? "border-red-500 focus:ring-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-red-400 hover:text-red-300 font-semibold hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
