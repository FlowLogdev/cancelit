"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { AlertCircle, TestTube } from "lucide-react"

export function AuthDiagnostic() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const runAuthDiagnostic = async () => {
    setIsLoading(true)
    setTestResult("")

    let report = "🔍 AUTHENTICATION DIAGNOSTIC REPORT\n"
    report += "=" * 50 + "\n\n"

    try {
      // 1. Environment Check
      report += "1. ENVIRONMENT VARIABLES:\n"
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      report += `   SUPABASE_URL: ${hasUrl ? "✅ Set" : "❌ Missing"}\n`
      report += `   SUPABASE_ANON_KEY: ${hasKey ? "✅ Set" : "❌ Missing"}\n`

      if (hasUrl) {
        report += `   URL Length: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.length} chars\n`
      }
      if (hasKey) {
        report += `   Key Length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length} chars\n`
      }
      report += "\n"

      // 2. Supabase Client Test
      report += "2. SUPABASE CLIENT TEST:\n"
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        report += `   Client Creation: ✅ Success\n`
        report += `   Session Check: ${sessionError ? "❌ Error" : "✅ Success"}\n`

        if (sessionError) {
          report += `   Session Error: ${sessionError.message}\n`
        }
      } catch (clientError) {
        report += `   Client Creation: ❌ Failed\n`
        report += `   Error: ${clientError instanceof Error ? clientError.message : String(clientError)}\n`
      }
      report += "\n"

      // 3. Direct Signup Test
      report += "3. DIRECT SIGNUP API TEST:\n"
      const testEmail = `test-${Date.now()}@example.com`
      const testPassword = "test123456"

      report += `   Test Email: ${testEmail}\n`
      report += `   Test Password: ${testPassword}\n`

      try {
        console.log("🧪 Starting direct signup test...")

        const signupResponse = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              full_name: "Test User",
            },
          },
        })

        console.log("🧪 Signup response:", signupResponse)

        report += `   API Call: ✅ Completed\n`
        report += `   Response Type: ${typeof signupResponse}\n`
        report += `   Has Data: ${!!signupResponse.data}\n`
        report += `   Has Error: ${!!signupResponse.error}\n`

        if (signupResponse.error) {
          const error = signupResponse.error
          report += `   Error Details:\n`
          report += `     - Message: "${error.message || "No message"}"\n`
          report += `     - Status: ${error.status || "No status"}\n`
          report += `     - Code: ${error.code || "No code"}\n`
          report += `     - Name: ${error.name || "No name"}\n`
          report += `     - Type: ${typeof error}\n`
          report += `     - Constructor: ${error.constructor?.name || "Unknown"}\n`
          report += `     - Keys: [${Object.keys(error).join(", ")}]\n`

          // Check for common issues
          if (error.message?.includes("Signup is disabled")) {
            report += `   🚨 ISSUE: Signup is disabled in Supabase settings\n`
          } else if (error.message?.includes("Invalid email")) {
            report += `   🚨 ISSUE: Email validation failed\n`
          } else if (error.message?.includes("SMTP")) {
            report += `   🚨 ISSUE: SMTP configuration problem\n`
          }
        }

        if (signupResponse.data?.user) {
          report += `   User Created: ✅ Yes\n`
          report += `   User ID: ${signupResponse.data.user.id}\n`
          report += `   User Email: ${signupResponse.data.user.email}\n`
          report += `   Email Confirmed: ${!!signupResponse.data.user.email_confirmed_at}\n`
        } else {
          report += `   User Created: ❌ No\n`
        }
      } catch (signupError) {
        report += `   API Call: ❌ Failed\n`
        report += `   Error Type: ${typeof signupError}\n`
        report += `   Error Message: ${signupError instanceof Error ? signupError.message : String(signupError)}\n`

        if (signupError instanceof Error) {
          report += `   Error Stack: ${signupError.stack}\n`
        }
      }
      report += "\n"

      // 4. Network Test
      report += "4. NETWORK CONNECTIVITY:\n"
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
        })
        report += `   Supabase API: ${response.ok ? "✅ Reachable" : "❌ Error"}\n`
        report += `   Status Code: ${response.status}\n`
      } catch (networkError) {
        report += `   Supabase API: ❌ Unreachable\n`
        report += `   Network Error: ${networkError instanceof Error ? networkError.message : String(networkError)}\n`
      }
      report += "\n"

      // 5. Recommendations
      report += "5. RECOMMENDATIONS:\n"
      if (!hasUrl || !hasKey) {
        report += "   ❌ Set missing environment variables\n"
      }
      report += "   📋 Check Supabase Dashboard → Authentication → Settings\n"
      report += "   📋 Ensure 'Enable email signup' is ON\n"
      report += "   📋 Ensure 'Enable email confirmations' is ON\n"
      report += "   📋 Verify Site URL matches your domain\n"
      report += "   📋 Check SMTP settings if using custom email\n"
    } catch (error) {
      report += `\n❌ DIAGNOSTIC FAILED:\n`
      report += `Error: ${error instanceof Error ? error.message : String(error)}\n`
    }

    setTestResult(report)
    setIsLoading(false)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Authentication Diagnostic Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button onClick={runAuthDiagnostic} disabled={isLoading}>
            {isLoading ? "Running Tests..." : "Run Authentication Diagnostic"}
          </Button>
          <Badge variant="outline">Development Tool</Badge>
        </div>

        {testResult && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto">{testResult}</pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>How to use this tool:</strong>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Click "Run Authentication Diagnostic" to test your setup</li>
                <li>Review the detailed report for any configuration issues</li>
                <li>Follow the recommendations to fix any problems</li>
                <li>This tool creates test accounts - clean them up in Supabase if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
