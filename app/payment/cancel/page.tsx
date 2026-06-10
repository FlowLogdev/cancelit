"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-12 w-12 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-orange-800 mb-2">Payment Cancelled</CardTitle>
          <CardDescription className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">What happened?</h3>
            <p className="text-sm text-orange-700">
              You cancelled the payment process before it was completed. Your subscription was not activated.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => router.push("/pricing")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">Still interested in CancelIt?</p>
            <p className="text-xs text-gray-400">You can always start with our free plan and upgrade later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
