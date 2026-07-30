"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [countdown, setCountdown] = useState(5)
  const [verifying, setVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("No session ID found")
        setVerifying(false)
        return
      }

      try {
        console.log("Verifying payment for session:", sessionId)

        const response = await fetch("/api/verify-payment-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Payment verification failed")
        }

        const data = await response.json()
        console.log("Payment verified:", data)
        setPaymentData(data)
        setVerifying(false)
      } catch (err: any) {
        console.error("Verification error:", err)
        setError(err.message || "Failed to verify payment")
        setVerifying(false)
      }
    }

    verifyPayment()
  }, [sessionId])

  useEffect(() => {
    if (!verifying && !error && paymentData) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push("/dashboard")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [verifying, error, paymentData, router])

  if (verifying) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CancelItLogo
              href=""
              className="mb-4 justify-center"
              imageClassName="h-14 w-14 rounded-2xl"
              textClassName="text-2xl"
            />
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-green-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl text-white">Verifying Payment</CardTitle>
            <CardDescription className="text-gray-400">Please wait while we confirm your payment...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CancelItLogo
              href=""
              className="mb-4 justify-center"
              imageClassName="h-14 w-14 rounded-2xl"
              textClassName="text-2xl"
            />
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-white">Verification Error</CardTitle>
            <CardDescription className="text-gray-400">{error}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              If your payment was successful but verification failed, please contact support.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => router.push("/dashboard")} className="w-full bg-red-600 hover:bg-red-700">
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="w-full border-gray-700 text-white hover:bg-gray-800"
              >
                Back to Pricing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <CancelItLogo
            href=""
            className="mb-4 justify-center"
            imageClassName="h-14 w-14 rounded-2xl"
            textClassName="text-2xl"
          />
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-white">Payment Successful</CardTitle>
          <CardDescription className="text-gray-400">
            Thank you for subscribing to CancelIt {paymentData?.planName || "Pro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentData && (
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Plan:</span>
                <span className="text-white font-semibold">{paymentData.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">${(paymentData.amount / 100).toFixed(2)}/month</span>
              </div>
              {paymentData.customerEmail && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-white font-semibold text-sm">{paymentData.customerEmail}</span>
                </div>
              )}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-gray-400">Redirecting to your dashboard in {countdown} seconds...</p>
            <p className="text-sm text-gray-500">Your subscription is now active!</p>
          </div>

          <Button onClick={() => router.push("/dashboard")} className="w-full bg-red-600 hover:bg-red-700">
            Go to Dashboard Now
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
