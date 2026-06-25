"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, ArrowRight, Upload, FileText, Zap } from "lucide-react"
import PlaidBankConnection from "@/components/plaid/plaid-bank-connection"

export default function ImportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [importStep, setImportStep] = useState(1)
  const [progress, setProgress] = useState(25)

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [router, user])

  if (!user) return null

  const steps = [
    { id: 1, title: "Connect Bank Account", description: "Securely link your financial accounts" },
    { id: 2, title: "Scan Transactions", description: "We'll analyze your transaction history" },
    { id: 3, title: "Review Subscriptions", description: "Confirm detected recurring payments" },
    { id: 4, title: "Start Managing", description: "Track and cancel subscriptions easily" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Your Subscriptions</h1>
              <p className="text-gray-600">Connect your bank account to automatically detect subscriptions</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Skip for Now
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Setup Progress</h2>
            <span className="text-sm text-gray-500">Step {importStep} of 4</span>
          </div>
          <Progress value={progress} className="mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border ${
                  step.id === importStep
                    ? "border-blue-500 bg-blue-50"
                    : step.id < importStep
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center mb-2">
                  {step.id < importStep ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full mr-2 ${step.id === importStep ? "bg-blue-500" : "bg-gray-300"}`}
                    />
                  )}
                  <h3 className="font-medium text-sm">{step.title}</h3>
                </div>
                <p className="text-xs text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {importStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Connect Your Bank Account</CardTitle>
                <CardDescription>
                  We'll securely connect to your bank to automatically detect subscription charges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-1">Bank-Level Security</h4>
                    <p className="text-sm text-gray-600">256-bit encryption protects your data</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-1">Instant Detection</h4>
                    <p className="text-sm text-gray-600">Find subscriptions in seconds</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium mb-1">Read-Only Access</h4>
                    <p className="text-sm text-gray-600">We never store your credentials</p>
                  </div>
                </div>

                <PlaidBankConnection />

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => {
                      setImportStep(2)
                      setProgress(50)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Scan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {importStep === 2 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Scanning Your Transactions</CardTitle>
              <CardDescription>
                We're analyzing your transaction history to find recurring subscription charges
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Analyzing transactions...</span>
                </div>
                <Progress value={75} />
                <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
              </div>

              <Button
                onClick={() => {
                  setImportStep(3)
                  setProgress(75)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Results
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {importStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Detected Subscriptions</CardTitle>
              <CardDescription>We found these recurring charges that appear to be subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-8">
                {[
                  { name: "Netflix", amount: 15.99, confidence: "High", category: "Entertainment" },
                  { name: "Spotify", amount: 9.99, confidence: "High", category: "Music" },
                  { name: "Adobe Creative Suite", amount: 52.99, confidence: "Medium", category: "Software" },
                  { name: "Amazon Prime", amount: 14.99, confidence: "High", category: "Shopping" },
                ].map((sub, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{sub.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>${sub.amount}/month</span>
                          <Badge variant="secondary">{sub.category}</Badge>
                          <Badge
                            variant={sub.confidence === "High" ? "default" : "secondary"}
                            className={sub.confidence === "High" ? "bg-green-100 text-green-800" : ""}
                          >
                            {sub.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Add to Tracker</Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setImportStep(4)
                    setProgress(100)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {importStep === 4 && (
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Setup complete</CardTitle>
              <CardDescription>
                Your subscriptions have been imported and you're ready to start managing them
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold mb-4">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Track Spending</h4>
                    <p className="text-gray-600">Monitor your monthly subscription costs</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Get Alerts</h4>
                    <p className="text-gray-600">Receive notifications before renewals</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Cancel Easily</h4>
                    <p className="text-gray-600">Remove unwanted subscriptions quickly</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => router.push("/dashboard")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
