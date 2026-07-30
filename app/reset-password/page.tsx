"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isValidLink, setIsValidLink] = useState(false)
  const [isCheckingLink, setIsCheckingLink] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const checkResetLink = async () => {
      setIsCheckingLink(true)

      // Check if we have the necessary parameters in the URL
      const accessToken = searchParams.get("access_token")
      const refreshToken = searchParams.get("refresh_token")
      const type = searchParams.get("type")

      console.log("Reset link params:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type })

      if (type === "recovery" && accessToken && refreshToken) {
        try {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          console.log("Session set result:", { data: !!data.session, error })

          if (error) {
            setError("Invalid or expired reset link. Please request a new password reset.")
          } else if (data.session) {
            setIsValidLink(true)
          }
        } catch (error) {
          console.error("Session error:", error)
          setError("Invalid reset link. Please request a new password reset.")
        }
      } else {
        setError("Invalid reset link. Please request a new password reset from the sign-in page.")
      }

      setIsCheckingLink(false)
    }

    checkResetLink()
  }, [searchParams, supabase.auth])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters long")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Sign out and redirect to login after successful password reset
        setTimeout(async () => {
          await supabase.auth.signOut()
          router.push("/signin?message=password_updated")
        }, 3000)
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setError("Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/[0.08] bg-[#0F0F0F] text-white">
          <CardContent className="p-6 text-center">
            <CancelItLogo
              href=""
              className="mx-auto mb-5 justify-center"
              imageClassName="h-14 w-14 rounded-2xl"
              textClassName="text-2xl"
            />
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Reset Link</h2>
            <p className="text-white/50">Please wait while we verify your password reset link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/[0.08] bg-[#0F0F0F] text-white">
          <CardContent className="p-6 text-center">
            <CancelItLogo
              href=""
              className="mx-auto mb-5 justify-center"
              imageClassName="h-14 w-14 rounded-2xl"
              textClassName="text-2xl"
            />
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Updated Successfully!</h2>
            <p className="text-white/55 mb-4">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <div className="bg-white/[0.04] border border-white/10 text-white/60 px-4 py-3 rounded-md text-sm">
              Redirecting to sign in page in a few seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValidLink && error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-white/[0.08] bg-[#0F0F0F] text-white">
          <CardHeader className="text-center">
            <CancelItLogo
              href=""
              className="mx-auto justify-center"
              imageClassName="h-14 w-14 rounded-2xl"
              textClassName="text-2xl"
            />
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Invalid Reset Link</h2>
            <p className="text-white/55 mb-6">{error}</p>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm mb-6">
              <strong>Common Issues:</strong>
              <ul className="mt-2 text-left list-disc list-inside space-y-1">
                <li>Reset link has expired (links expire after 1 hour)</li>
                <li>Link has already been used</li>
                <li>You may have requested multiple resets</li>
              </ul>
            </div>

            <Button onClick={() => router.push("/forgot-password")} className="w-full">
              Request New Reset Link
            </Button>
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
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription className="text-white/45">
            Enter your new password below to complete the reset process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4 flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  minLength={10}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-white/42">Password must be at least 10 characters long</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  minLength={10}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !isValidLink} className="w-full h-12 text-base font-medium">
              {isLoading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => router.push("/signin")}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Back to Sign In
            </Button>
          </div>

          <div className="mt-4 bg-white/[0.04] border border-white/10 text-white/50 px-4 py-3 rounded-md text-xs">
            <strong>Security Notice:</strong> After updating your password, you'll be automatically signed out and
            redirected to the sign-in page for security purposes.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
