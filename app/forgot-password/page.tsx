"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      console.log("🔄 Initiating password reset for:", email)
      console.log("🌐 Redirect URL:", `${window.location.origin}/reset-password`)

      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      console.log("📧 Password reset response:", { data, error: resetError })

      // Even if there's an error, show success for security reasons
      // (don't reveal if email exists in system)
      if (resetError) {
        console.error("❌ Reset error:", resetError)

        // Only show user-friendly errors for specific cases
        if (resetError.message?.includes("rate limit") || resetError.status === 429) {
          setError("Too many password reset requests. Please wait 10-15 minutes before trying again.")
          setIsLoading(false)
          return
        }

        if (resetError.status === 504 || resetError.message?.includes("timeout")) {
          setError(
            "The email service is currently experiencing issues. Please try again in a few minutes or contact support.",
          )
          setIsLoading(false)
          return
        }

        // For all other errors, show success message for security
        console.warn("⚠️ Showing success despite error for security reasons")
      }

      // Show success message
      setSuccess(true)

      // Auto-redirect to signin after 10 seconds
      setTimeout(() => {
        router.push("/signin")
      }, 10000)
    } catch (err) {
      console.error("❌ Unexpected password reset error:", err)
      setError("An unexpected error occurred. Please try again or contact support if the issue persists.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/[0.08] bg-[#0F0F0F] text-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CancelItLogo
                href=""
                className="mx-auto mb-5 justify-center"
                imageClassName="h-14 w-14 rounded-2xl"
                textClassName="text-2xl"
              />
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>

              <p className="text-white/55 mb-6">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>

              <div className="bg-white/[0.04] border border-white/10 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-white mb-2 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  What to do next:
                </h3>
                <ul className="text-sm text-white/62 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">1.</span>
                    <span>Check your email inbox (and spam/junk folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2.</span>
                    <span>Click the "Reset Password" link in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    <span>Enter your new password (10+ characters)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4.</span>
                    <span>Sign in with your new password</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-left">
                <div className="flex items-start">
                  <Info className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-yellow-800">
                    <p className="font-semibold mb-1">Important Notes:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>The reset link expires in 1 hour</li>
                      <li>The link can only be used once</li>
                      <li>Check your spam folder if you don't see the email</li>
                      <li>Email may take 2-5 minutes to arrive</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push("/signin")} className="w-full">
                  Back to Sign In
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  className="w-full"
                >
                  Send to Different Email
                </Button>
              </div>

              <p className="text-sm text-white/42 mt-4">Redirecting to sign in page in 10 seconds...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/[0.08] bg-[#0F0F0F] text-white">
        <CardHeader className="text-center">
          <CancelItLogo
            href=""
            className="mx-auto mb-4 justify-center"
            imageClassName="h-14 w-14 rounded-2xl"
            textClassName="text-2xl"
          />
          <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
          <CardDescription className="text-white/45">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4 flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !email} className="w-full h-12 text-base font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/signin")}
              className="text-sm text-muted-foreground hover:text-primary flex items-center mx-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Button>
          </div>

          <div className="mt-6 bg-white/[0.04] border border-white/10 rounded-lg p-4 text-xs text-white/45">
            <p className="font-semibold mb-2">Security & Privacy:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>We won't reveal whether an email exists in our system</li>
              <li>Password reset links are valid for 1 hour only</li>
              <li>Links can only be used once for security</li>
              <li>If you don't receive an email, check spam or contact support</li>
            </ul>
          </div>

          {/* SMTP Configuration Warning - Only show in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4 text-xs">
              <p className="font-semibold text-orange-900 mb-2">⚙️ Email Configuration Required:</p>
              <p className="text-orange-800 mb-2">
                To send password reset emails, configure SMTP in Supabase Dashboard:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-orange-800">
                <li>Go to Authentication → Settings → SMTP Settings</li>
                <li>Configure your email provider (Gmail, SendGrid, etc.)</li>
                <li>Add redirect URLs in URL Configuration</li>
                <li>Test the configuration</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
