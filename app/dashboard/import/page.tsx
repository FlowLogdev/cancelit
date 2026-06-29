"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import PlaidBankConnection from "@/components/plaid/plaid-bank-connection"
import { useAuth } from "@/lib/auth-context"

export default function ImportPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/signin")
    }
  }, [router, user])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Subscriptions</h1>
            <p className="text-gray-600">Connect Plaid, scan transactions, and choose which subscriptions to track.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PlaidBankConnection />
      </main>
    </div>
  )
}
