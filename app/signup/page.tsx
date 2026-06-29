"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Loader2, Mail, Lock, User, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"

export default function SignUpPage() {
  const router = useRouter()
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 10) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10
    return Math.min(strength, 100)
  }

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return "Weak"
    if (strength < 70) return "Fair"
    if (strength < 90) return "Good"
    return "Strong"
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-orange-500"
    if (strength < 90) return "bg-yellow-500"
    return "bg-green-500"
  }

  const passwordStrength = getPasswordStrength(password)

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNameError(null)
    setEmailError(null)
    setPasswordError(null)

    if (!fullName.trim()) {
      setNameError("Full name is required")
      return
    }

    if (fullName.trim().length < 2) {
      setNameError("Name must be at least 2 characters")
      return
    }

    if (!email) {
      setEmailError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    if (!password) {
      setPasswordError("Password is required")
      return
    }

    if (password.length <= 10) {
      setPasswordError("Password must be more than 10 characters")
      return
    }

    setIsLoading(true)

    try {
      await signUpWithEmail(email, password, fullName)

      setShowSuccess(true)
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      })

      // Redirect to the free dashboard after account creation.
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    } catch (err: any) {
      console.error("Sign up error:", err)

      const errorMessage = err?.message || ""

      if (errorMessage.includes("already registered") || errorMessage.includes("User already registered")) {
        setEmailError("This email is already registered. Please sign in instead.")
        toast({
          variant: "destructive",
          title: "Email already exists",
          description: "This email is already registered. Please sign in instead.",
        })
      } else if (errorMessage.includes("password")) {
        setPasswordError(errorMessage)
        toast({
          variant: "destructive",
          title: "Invalid password",
          description: errorMessage,
        })
      } else if (errorMessage.includes("email")) {
        setEmailError(errorMessage)
        toast({
          variant: "destructive",
          title: "Invalid email",
          description: errorMessage,
        })
      } else {
        setError(errorMessage || "Failed to create account. Please try again.")
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: errorMessage || "An unexpected error occurred.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
      // OAuth will redirect through callback, which then opens the dashboard.
    } catch (err: any) {
      console.error("Google sign up error:", err)
      setError(err?.message || "Failed to sign up with Google")
      toast({
        variant: "destructive",
        title: "Google sign up failed",
        description: err?.message || "Failed to sign up with Google. Please try again.",
      })
      setIsGoogleLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome to CancelIt</CardTitle>
            <CardDescription className="text-base">
              Your account has been created for <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Important:</strong> Check your email to confirm your account.
              </p>
              <p className="text-sm text-blue-800">
                You'll be redirected to your free dashboard in a moment. Free accounts can scan up to 5 subscriptions
                with Plaid.
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Open Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-white/50 hover:text-white/80 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="bg-[#0F0F0F] border-white/[0.08]">
          <CardHeader className="space-y-1 text-center">
            <div className="text-2xl font-black tracking-tight mb-1">
              Cancel<span className="text-red-500">It</span>
            </div>
            <CardTitle className="text-xl font-semibold">Create your account</CardTitle>
            <CardDescription className="text-white/45">Start discovering forgotten subscriptions</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/25 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value)
                      setNameError(null)
                      setError(null)
                    }}
                    className={`pl-10 ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                {nameError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {nameError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setEmailError(null)
                      setError(null)
                    }}
                    className={`pl-10 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {emailError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-white/30" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="More than 10 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setPasswordError(null)
                      setError(null)
                    }}
                    className={`pl-10 ${passwordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </p>
                )}

                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Password strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength < 40
                            ? "text-red-600"
                            : passwordStrength < 70
                              ? "text-orange-600"
                              : passwordStrength < 90
                                ? "text-yellow-600"
                                : "text-green-600"
                        }`}
                      >
                        {getPasswordStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      className="h-2"
                      indicatorClassName={getPasswordStrengthColor(passwordStrength)}
                    />
                    <p className="text-xs text-gray-500">
                      Use more than 10 characters with a mix of letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0F0F0F] text-white/45">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08] hover:text-white transition-colors"
              onClick={handleGoogleSignUp}
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
                  Sign up with Google
                </>
              )}
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/signin" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                Sign in
              </Link>
            </div>

            <p className="text-xs text-center text-white/40">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-red-400 hover:text-red-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-red-400 hover:text-red-300">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
