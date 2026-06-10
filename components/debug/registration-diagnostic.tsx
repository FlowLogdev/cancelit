"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { AlertCircle, TestTube } from "lucide-react"

export function RegistrationDiagnostic() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")

  const runFullDiagnostic = async () => {
    setIsLoading(true)
    setTestResult("")

    let report = "🔍 REGISTRATION DIAGNOSTIC REPORT\n"
    report += "=" * 50 + "\n\n"

    try {
      // 1. Environment Check
      report += "1. ENVIRONMENT VARIABLES:\n"
      report += `   ✅ NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}\n`
      report += `   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}\n`
      report += `   📍 Current Origin: ${window.location.origin}\n\n`

      // 2. Supabase Connection Test
      report += "2. SUPABASE CONNECTION:\n"
      try {
        const { data: healthCheck, error: healthError } = await supabase.auth.getSession()
        report += `   🔗 Connection: ${healthError ? "❌ Failed" : "✅ Success"}\n`
        if (healthError) {
          report += `   ❌ Error: ${healthError.message}\n`
        }
      } catch (connError) {
        report += `   ❌ Connection Failed: ${connError instanceof Error ? connError.message : "Unknown"}\n`
      }
      report += "\n"

      // 3. Auth Settings Check
      report += "3. AUTH SETTINGS CHECK:\n"
      try {
        // Try to get auth settings (this will fail if not properly configured)
        const { data: settings, error: settingsError } = await supabase.auth.getUser()
        report += `   👤 Auth Service: ${settingsError ? "❌ Error" : "✅ Available"}\n`
        if (settingsError) {
          report += `   ❌ Auth Error: ${settingsError.message}\n`
        }
      } catch (authError) {
        report += `   ❌ Auth Service Error: ${authError instanceof Error ? authError.message : "Unknown"}\n`
      }
      report += "\n"

      // 4. Registration Test
      report += "4. REGISTRATION TEST:\n"
      report += `   📧 Test Email: ${testEmail}\n`

      try {
        const testPassword = "test123456"
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              full_name: "Test User",
            },
          },
        })

        report += `   📦 Response Data: ${!!signupData}\n`
        report += `   ❌ Response Error: ${!!signupError}\n`

        if (signupError) {
          report += `   🔍 Error Analysis:\n`
          report += `      - Message: "${signupError.message || "No message"}"\n`
          report += `      - Status: ${signupError.status || "No status"}\n`
          report += `      - Code: ${signupError.code || "No code"}\n`

          // Check for common issues
          if (signupError.message?.includes("Signup is disabled")) {
            report += `   🚨 ISSUE FOUND: Signup is disabled in Supabase!\n`
            report += `      ➡️ Go to Supabase Dashboard → Authentication → Settings\n`
            report += `      ➡️ Enable "Enable email confirmations"\n`
            report += `      ➡️ Enable "Enable email signup"\n`
          }

          if (signupError.message?.includes("Invalid email")) {
            report += `   🚨 ISSUE FOUND: Email validation failed\n`
          }

          if (signupError.message?.includes("SMTP")) {
            report += `   🚨 ISSUE FOUND: SMTP not configured\n`
            report += `      ➡️ Configure SMTP in Supabase Dashboard\n`
          }
        }

        if (signupData?.user) {
          report += `   👤 User Created: ${!!signupData.user}\n`
          report += `   📧 Email Confirmed: ${!!signupData.user.email_confirmed_at}\n`
          report += `   🔑 User ID: ${signupData.user.id}\n`

          // Clean up test user
          if (signupData.user.id) {
            try {
              await supabase.auth.admin.deleteUser(signupData.user.id)
              report += `   🧹 Test user cleaned up\n`
            } catch (cleanupError) {
              report += `   ⚠️ Could not clean up test user (this is normal)\n`
            }
          }
        }
      } catch (testError) {
        report += `   💥 Registration Test Failed: ${testError instanceof Error ? testError.message : "Unknown"}\n`
      }
      report += "\n"

      // 5. Common Issues & Solutions
      report += "5. COMMON ISSUES & SOLUTIONS:\n"
      report += "   📋 If signup fails:\n"
      report += "      1. Check Supabase Dashboard → Authentication → Settings\n"
      report += "      2. Ensure 'Enable email signup' is ON\n"
      report += "      3. Ensure 'Enable email confirmations' is ON\n"
      report += "      4. Check 'Confirm email' setting\n"
      report += "      5. Verify Site URL is set correctly\n\n"

      report += "   🔧 Required Supabase Settings:\n"
      report += "      - Site URL: http://localhost:3000 (for development)\n"
      report += "      - Enable email signup: ON\n"
      report += "      - Enable email confirmations: ON\n"
      report += "      - Confirm email: ON (recommended)\n"
      report += "      - Enable phone signup: OFF (unless needed)\n\n"

      report += "   📧 Email Configuration:\n"
      report += "      - SMTP must be configured for email confirmations\n"
      report += "      - Add redirect URLs in URL Configuration\n"
      report += "      - Test email delivery in SMTP settings\n\n"

      setTestResult(report)
    } catch (error) {
      setTestResult(`💥 Diagnostic Failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkSupabaseSettings = () => {
    const settings = `🔧 REQUIRED SUPABASE SETTINGS CHECKLIST:

📍 Go to: Supabase Dashboard → Your Project → Authentication → Settings

✅ GENERAL SETTINGS:
   □ Site URL: ${window.location.origin}
   □ Enable email signup: ON
   □ Enable email confirmations: ON  
   □ Confirm email: ON (recommended)
   □ Enable phone signup: OFF (unless needed)

✅ EMAIL SETTINGS:
   □ SMTP configured (required for confirmations)
   □ Email templates customized
   □ Test email delivery working

✅ URL CONFIGURATION:
   □ Redirect URLs added:
     - ${window.location.origin}/auth/callback
     - ${window.location.origin}/reset-password

✅ SECURITY SETTINGS:
   □ Row Level Security enabled on tables
   □ Auth policies configured

🚨 MOST COMMON ISSUE:
   "Signup is disabled" → Enable email signup in General settings`

    setTestResult(settings)
  }

  const testBasicSignup = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "test123456",
        options: {
          data: { full_name: "Test User" },
        },
      })

      let result = `📝 BASIC SIGNUP TEST RESULT:\n\n`
      result += `📧 Email: ${testEmail}\n`
      result += `🔐 Password: test123456\n\n`

      if (error) {
        result += `❌ ERROR DETAILS:\n`
        result += `   Message: ${error.message || "No message"}\n`
        result += `   Status: ${error.status || "No status"}\n`
        result += `   Code: ${error.code || "No code"}\n\n`

        if (error.message?.includes("Signup is disabled")) {
          result += `🚨 SOLUTION: Enable email signup in Supabase Dashboard\n`
          result += `   1. Go to Authentication → Settings\n`
          result += `   2. Turn ON "Enable email signup"\n`
          result += `   3. Turn ON "Enable email confirmations"\n`
          result += `   4. Save settings\n`
        }
      } else {
        result += `✅ SUCCESS!\n`
        result += `   User ID: ${data.user?.id}\n`
        result += `   Email: ${data.user?.email}\n`
        result += `   Confirmed: ${!!data.user?.email_confirmed_at}\n`
      }

      setTestResult(result)
    } catch (error) {
      setTestResult(`💥 Test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Registration Diagnostic Tool
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email</Label>
          <Input
            id="test-email"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter email for registration test"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button onClick={runFullDiagnostic} disabled={isLoading} variant="default">
            {isLoading ? "Running..." : "Full Diagnostic"}
          </Button>

          <Button onClick={testBasicSignup} disabled={isLoading} variant="outline">
            {isLoading ? "Testing..." : "Test Signup"}
          </Button>

          <Button onClick={checkSupabaseSettings} variant="outline">
            Settings Checklist
          </Button>
        </div>

        {testResult && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {testResult}
          </div>
        )}

        {/* Quick Fix Instructions */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-red-700">
              <h3 className="font-semibold mb-2">🚨 Most Common Registration Issue:</h3>
              <p className="text-sm mb-2">
                <strong>"Signup is disabled"</strong> error means email registration is turned off in Supabase.
              </p>
              <div className="text-xs space-y-1">
                <p>
                  <strong>Quick Fix:</strong>
                </p>
                <p>1. Go to Supabase Dashboard → Authentication → Settings</p>
                <p>2. Turn ON "Enable email signup"</p>
                <p>3. Turn ON "Enable email confirmations"</p>
                <p>
                  4. Set Site URL to: <code className="bg-white px-1 rounded">{window.location.origin}</code>
                </p>
                <p>5. Save settings and try again</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
