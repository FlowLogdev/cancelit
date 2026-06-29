"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, ArrowLeft, Loader2, Lock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState<"email" | "password" | null>(null)
  const router = useRouter()
  const { signInWithEmail, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setFieldError(null)

    try {
      await signInWithEmail(email, password)
      const searchParams = new URLSearchParams(window.location.search)
      const redirectTo = searchParams.get("redirect")
      router.push(redirectTo?.startsWith("/") ? redirectTo : "/dashboard")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during sign in"

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError("")
    setFieldError(null)

    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google")
      setIsGoogleLoading(false)
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
                  disabled={isLoading || isGoogleLoading}
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
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full h-12 text-base font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0F0F0F] px-2 text-white/45">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-red-400 hover:text-red-300 font-semibold hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
