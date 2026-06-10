"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { sendPasswordResetEmail, resendConfirmationEmail } from "@/lib/email-config"

export function SMTPTest() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")

  const testSMTPConnection = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      console.log("Testing SMTP connection...")

      // Test password reset email
      const result = await sendPasswordResetEmail(testEmail)

      if (result.error) {
        setTestResult(`❌ SMTP Test Failed:\n${JSON.stringify(result.error, null, 2)}`)
      } else {
        setTestResult(
          `✅ SMTP Test Successful!\nPassword reset email sent to: ${testEmail}\n\nResponse: ${JSON.stringify(result.data, null, 2)}`,
        )
      }
    } catch (error) {
      console.error("SMTP test error:", error)
      setTestResult(`❌ SMTP Test Error:\n${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testConfirmationEmail = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      console.log("Testing confirmation email...")

      const result = await resendConfirmationEmail(testEmail)

      if (result.error) {
        setTestResult(`❌ Confirmation Email Test Failed:\n${JSON.stringify(result.error, null, 2)}`)
      } else {
        setTestResult(
          `✅ Confirmation Email Test Successful!\nConfirmation email sent to: ${testEmail}\n\nResponse: ${JSON.stringify(result.data, null, 2)}`,
        )
      }
    } catch (error) {
      console.error("Confirmation email test error:", error)
      setTestResult(`❌ Confirmation Email Test Error:\n${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkEmailSettings = () => {
    const settings = {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      resetRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
      confirmRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    }

    setTestResult(`📧 Email Configuration Check:

Site URL: ${settings.siteUrl}
Supabase URL: ${settings.supabaseUrl || "❌ Missing"}
Supabase Key: ${settings.hasSupabaseKey ? "✅ Present" : "❌ Missing"}

Redirect URLs:
- Password Reset: ${settings.resetRedirectUrl}
- Email Confirmation: ${settings.confirmRedirectUrl}

⚠️ Make sure these URLs are added to your Supabase project's:
Authentication > URL Configuration > Redirect URLs`)
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📧 SMTP & Email Testing Panel
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email to test SMTP functionality"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={testSMTPConnection} disabled={isLoading} variant="outline">
            {isLoading ? "Testing..." : "Test Password Reset"}
          </Button>

          <Button onClick={testConfirmationEmail} disabled={isLoading} variant="outline">
            {isLoading ? "Testing..." : "Test Confirmation Email"}
          </Button>

          <Button onClick={checkEmailSettings} disabled={isLoading} variant="outline">
            Check Email Config
          </Button>
        </div>

        {testResult && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {testResult}
          </div>
        )}

        {/* SMTP Configuration Guide */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm">
          <h3 className="font-semibold text-blue-900 mb-2">🔧 SMTP Configuration Required</h3>
          <div className="text-blue-700 space-y-2">
            <p>
              <strong>1. Go to Supabase Dashboard:</strong>
            </p>
            <p className="ml-4">Authentication → Settings → SMTP Settings</p>

            <p>
              <strong>2. Configure SMTP (Gmail Example):</strong>
            </p>
            <div className="ml-4 bg-white p-2 rounded border text-xs font-mono">
              Host: smtp.gmail.com
              <br />
              Port: 587
              <br />
              User: your-email@gmail.com
              <br />
              Pass: your-app-password
              <br />
              Sender: CancelIt &lt;your-email@gmail.com&gt;
            </div>

            <p>
              <strong>3. Update Email Templates:</strong>
            </p>
            <p className="ml-4">Authentication → Email Templates → Customize templates</p>

            <p>
              <strong>4. Set Redirect URLs:</strong>
            </p>
            <p className="ml-4">Authentication → URL Configuration → Add redirect URLs</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
