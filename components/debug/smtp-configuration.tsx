"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmailService } from "@/lib/email-service"
import { Copy, CheckCircle, AlertCircle, Mail, Settings, TestTube } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SMTPConfiguration() {
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [copiedText, setCopiedText] = useState<string>("")

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(""), 2000)
  }

  const testPasswordReset = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      const result = await EmailService.sendPasswordReset(testEmail)

      if (result.success) {
        setTestResult(
          `✅ Password Reset Test Successful!\n\n${result.message}\n\nData: ${JSON.stringify(result.data, null, 2)}`,
        )
      } else {
        setTestResult(
          `❌ Password Reset Test Failed!\n\n${result.message}\n\nError: ${result.error || "Unknown error"}`,
        )
      }
    } catch (error) {
      setTestResult(`💥 Test Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testConfirmationEmail = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      const result = await EmailService.sendEmailConfirmation(testEmail)

      if (result.success) {
        setTestResult(
          `✅ Confirmation Email Test Successful!\n\n${result.message}\n\nData: ${JSON.stringify(result.data, null, 2)}`,
        )
      } else {
        setTestResult(
          `❌ Confirmation Email Test Failed!\n\n${result.message}\n\nError: ${result.error || "Unknown error"}`,
        )
      }
    } catch (error) {
      setTestResult(`💥 Test Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSMTPConnection = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      const result = await EmailService.testSMTPConnection(testEmail)
      setTestResult(`🧪 SMTP Connection Test:\n\n${result.message}\n\nDetails: ${JSON.stringify(result.data, null, 2)}`)
    } catch (error) {
      setTestResult(`💥 SMTP Test Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const checkConfiguration = () => {
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || window.location.origin,
      resetUrl: `${window.location.origin}/reset-password`,
      callbackUrl: `${window.location.origin}/auth/callback`,
    }

    setTestResult(`🔍 Configuration Check:

Environment Variables:
✅ Supabase URL: ${config.supabaseUrl ? "Set" : "❌ Missing"}
✅ Supabase Key: ${config.hasSupabaseKey ? "Set" : "❌ Missing"}
✅ Site URL: ${config.siteUrl}

Redirect URLs:
📧 Password Reset: ${config.resetUrl}
🔗 Auth Callback: ${config.callbackUrl}

⚠️ Make sure these URLs are configured in Supabase:
1. Go to Supabase Dashboard
2. Authentication > URL Configuration
3. Add both URLs to "Redirect URLs"`)
  }

  const runComprehensiveDiagnostic = async () => {
    setIsLoading(true)
    setTestResult("")

    try {
      let diagnosticReport = "🔍 COMPREHENSIVE SMTP DIAGNOSTIC REPORT\n"
      diagnosticReport += "=" * 50 + "\n\n"

      // 1. Environment Check
      diagnosticReport += "1. ENVIRONMENT CHECK:\n"
      diagnosticReport += `   ✅ Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "❌ Missing"}\n`
      diagnosticReport += `   ✅ Supabase Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "❌ Missing"}\n`
      diagnosticReport += `   ✅ Site URL: ${window.location.origin}\n\n`

      // 2. Supabase Connection Test
      diagnosticReport += "2. SUPABASE CONNECTION TEST:\n"
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        diagnosticReport += `   ✅ Connection: ${sessionError ? "❌ Failed" : "✅ Success"}\n`
        if (sessionError) {
          diagnosticReport += `   ❌ Error: ${sessionError.message}\n`
        }
      } catch (connError) {
        diagnosticReport += `   ❌ Connection: Failed - ${connError instanceof Error ? connError.message : "Unknown"}\n`
      }
      diagnosticReport += "\n"

      // 3. Password Reset Test with Detailed Logging
      diagnosticReport += "3. PASSWORD RESET TEST:\n"
      diagnosticReport += `   📧 Test Email: ${testEmail}\n`

      try {
        // Make the actual request
        const startTime = Date.now()
        const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        const endTime = Date.now()

        diagnosticReport += `   ⏱️ Response Time: ${endTime - startTime}ms\n`
        diagnosticReport += `   📦 Has Data: ${!!data}\n`
        diagnosticReport += `   ❌ Has Error: ${!!error}\n`

        if (error) {
          diagnosticReport += `   🔍 Error Analysis:\n`
          diagnosticReport += `      - Type: ${typeof error}\n`
          diagnosticReport += `      - Constructor: ${error?.constructor?.name || "Unknown"}\n`
          diagnosticReport += `      - Keys: [${Object.keys(error || {}).join(", ")}]\n`
          diagnosticReport += `      - Values: [${Object.values(error || {}).join(", ")}]\n`
          diagnosticReport += `      - String: "${String(error)}"\n`
          diagnosticReport += `      - JSON: ${JSON.stringify(error, null, 2)}\n`
          diagnosticReport += `      - Is Empty: ${Object.keys(error || {}).length === 0}\n`

          if (error.message) {
            diagnosticReport += `      - Message: "${error.message}"\n`
          }
          if (error.status) {
            diagnosticReport += `      - Status: ${error.status}\n`
          }
        }

        if (data) {
          diagnosticReport += `   📄 Data: ${JSON.stringify(data, null, 2)}\n`
        }
      } catch (resetError) {
        diagnosticReport += `   💥 Request Failed: ${resetError instanceof Error ? resetError.message : "Unknown"}\n`
      }
      diagnosticReport += "\n"

      // 4. Common Issues Check
      diagnosticReport += "4. COMMON ISSUES CHECK:\n"

      // Check if SMTP might not be configured
      diagnosticReport += "   🔧 SMTP Configuration:\n"
      diagnosticReport += "      - Check Supabase Dashboard → Authentication → Settings → SMTP\n"
      diagnosticReport += "      - Ensure SMTP is enabled and configured\n"
      diagnosticReport += "      - Verify SMTP credentials are correct\n"
      diagnosticReport += "      - Test SMTP connection in Supabase dashboard\n\n"

      // Check redirect URLs
      diagnosticReport += "   🔗 Redirect URLs:\n"
      diagnosticReport += "      - Check Supabase Dashboard → Authentication → URL Configuration\n"
      diagnosticReport += `      - Add: ${window.location.origin}/reset-password\n`
      diagnosticReport += `      - Add: ${window.location.origin}/auth/callback\n\n`

      // 5. Recommendations
      diagnosticReport += "5. RECOMMENDATIONS:\n"
      diagnosticReport += "   📋 If you see empty error objects:\n"
      diagnosticReport += "      1. SMTP is likely not configured in Supabase\n"
      diagnosticReport += "      2. Go to Supabase Dashboard → Authentication → Settings\n"
      diagnosticReport += "      3. Configure SMTP with Gmail or SendGrid\n"
      diagnosticReport += "      4. Test SMTP connection in dashboard\n"
      diagnosticReport += "      5. Save settings and try again\n\n"

      diagnosticReport += "   🔧 For Gmail SMTP:\n"
      diagnosticReport += "      - Host: smtp.gmail.com\n"
      diagnosticReport += "      - Port: 587\n"
      diagnosticReport += "      - Use App Password (not regular password)\n"
      diagnosticReport += "      - Enable 2FA first, then generate App Password\n\n"

      setTestResult(diagnosticReport)
    } catch (error) {
      setTestResult(`💥 Diagnostic Failed: ${error instanceof Error ? error.message : String(error)}`)
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
          <Mail className="w-5 h-5" />
          SMTP Configuration & Testing
          <Badge variant="outline">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="test" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="test">
              <TestTube className="w-4 h-4 mr-2" />
              Test Emails
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="setup">
              <Mail className="w-4 h-4 mr-2" />
              Setup Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <Button onClick={testPasswordReset} disabled={isLoading} variant="outline">
                {isLoading ? "Testing..." : "Test Password Reset"}
              </Button>

              <Button onClick={testConfirmationEmail} disabled={isLoading} variant="outline">
                {isLoading ? "Testing..." : "Test Confirmation"}
              </Button>

              <Button onClick={testSMTPConnection} disabled={isLoading} variant="outline">
                {isLoading ? "Testing..." : "Test SMTP"}
              </Button>

              <Button onClick={checkConfiguration} disabled={isLoading} variant="outline">
                Check Config
              </Button>

              <Button onClick={runComprehensiveDiagnostic} disabled={isLoading} variant="default">
                {isLoading ? "Diagnosing..." : "Full Diagnostic"}
              </Button>
            </div>

            {testResult && (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {testResult}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Gmail SMTP (Recommended for Testing)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span>Host: smtp.gmail.com</span>
                      <Button size="sm" variant="ghost" onClick={() => copyToClipboard("smtp.gmail.com", "Gmail Host")}>
                        {copiedText === "Gmail Host" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div>Port: 587</div>
                    <div>Username: your-email@gmail.com</div>
                    <div>Password: [app-password]</div>
                    <div>Sender: CancelIt &lt;your-email@gmail.com&gt;</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Setup Steps:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Enable 2-Factor Authentication</li>
                      <li>Generate App Password in Google Account</li>
                      <li>Use App Password (not regular password)</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">SendGrid SMTP (Production)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span>Host: smtp.sendgrid.net</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard("smtp.sendgrid.net", "SendGrid Host")}
                      >
                        {copiedText === "SendGrid Host" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div>Port: 587</div>
                    <div>Username: apikey</div>
                    <div>Password: [sendgrid-api-key]</div>
                    <div>Sender: CancelIt &lt;noreply@yourdomain.com&gt;</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Benefits:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Better deliverability</li>
                      <li>Higher sending limits</li>
                      <li>Detailed analytics</li>
                      <li>Professional appearance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Configure SMTP in Supabase
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Go to <strong>Supabase Dashboard</strong> → Your Project
                    </li>
                    <li>
                      Navigate to <strong>Authentication</strong> → <strong>Settings</strong> →{" "}
                      <strong>SMTP Settings</strong>
                    </li>
                    <li>Enable SMTP and fill in your provider details</li>
                    <li>Test the connection and save</li>
                  </ol>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    <strong>Important:</strong> Make sure to click "Save" after entering SMTP settings!
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    Update Email Templates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Go to <strong>Authentication</strong> → <strong>Email Templates</strong>
                    </li>
                    <li>
                      Customize the <strong>Password Recovery</strong> template
                    </li>
                    <li>
                      Customize the <strong>Email Confirmation</strong> template
                    </li>
                    <li>Make sure to use proper branding and styling</li>
                  </ol>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                    Password Recovery Template:
                    <br />
                    Subject: Reset Your CancelIt Password
                    <br />
                    Body: Include {`{{ .SiteURL }}`}/reset-password link
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    Configure Redirect URLs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Go to <strong>Authentication</strong> → <strong>URL Configuration</strong>
                    </li>
                    <li>
                      Set <strong>Site URL</strong> to your domain
                    </li>
                    <li>Add redirect URLs to the list:</li>
                  </ol>
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
                    <div className="flex justify-between items-center">
                      <span>http://localhost:3000/reset-password</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard("http://localhost:3000/reset-password", "Reset URL")}
                      >
                        {copiedText === "Reset URL" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>http://localhost:3000/auth/callback</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard("http://localhost:3000/auth/callback", "Callback URL")}
                      >
                        {copiedText === "Callback URL" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    Test & Verify
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Use the test buttons above to verify email delivery</li>
                    <li>Check spam/junk folders if emails don't arrive</li>
                    <li>Monitor Supabase logs for any errors</li>
                    <li>Test with different email providers</li>
                  </ol>
                  <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    <strong>Success:</strong> Once configured, password reset emails should arrive within 1-2 minutes.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
