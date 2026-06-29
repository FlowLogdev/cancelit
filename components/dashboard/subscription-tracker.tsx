"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpRight, CalendarClock, CheckCircle2, CreditCard, Loader2, Plus, ReceiptText, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { AddSubscriptionModal } from "@/components/subscriptions/add-subscription-modal"
import { useRouter } from "next/navigation"

interface Subscription {
  id: string
  name: string
  cost: number
  billing_cycle: string
  next_billing_date: string
  category: string
  status: string
  website_url?: string | null
}

export function SubscriptionTracker() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [requestingId, setRequestingId] = useState<string | null>(null)
  const [cancellationGuide, setCancellationGuide] = useState<{
    subscriptionName: string
    url?: string | null
    instructions: string[]
    message: string
  } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const loadSubscriptions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("next_billing_date", { ascending: true })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (error) {
      console.error("Error loading subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const monthlyTotal = useMemo(
    () =>
      subscriptions.reduce((total, sub) => {
        if (sub.status !== "active" && sub.status !== "pending_cancellation") return total
        if (sub.billing_cycle === "yearly") return total + sub.cost / 12
        if (sub.billing_cycle === "weekly") return total + sub.cost * 4.33
        return total + sub.cost
      }, 0),
    [subscriptions],
  )

  const handleCancellationRequest = async (subscription: Subscription) => {
    try {
      setRequestingId(subscription.id)
      setCancellationGuide(null)

      const response = await fetch("/api/cancellation-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Could not create cancellation request")
      }

      setCancellationGuide({
        subscriptionName: subscription.name,
        url: data.guide?.cancellation_url,
        instructions: data.guide?.instructions || [],
        message: data.message || "Cancellation request created.",
      })
      await loadSubscriptions()
    } catch (error) {
      setCancellationGuide({
        subscriptionName: subscription.name,
        instructions: [
          error instanceof Error ? error.message : "We could not create the cancellation request.",
          "Check that the database has the latest cancellation_requests table.",
        ],
        message: "Request failed.",
      })
    } finally {
      setRequestingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === "pending_cancellation") {
      return <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-200">Cancel requested</Badge>
    }

    if (status === "cancelled") {
      return <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200">Cancelled</Badge>
    }

    return <Badge className="border-white/10 bg-white/[0.06] text-white/62">{status}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-white/[0.08] bg-[#0b0b0b]">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Subscriptions</CardTitle>
              <CardDescription className="text-white/42">
                {subscriptions.length} tracked services, about ${monthlyTotal.toFixed(2)} per month
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="bg-red-500 text-white hover:bg-red-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-6 py-12 text-center">
              <ReceiptText className="mx-auto mb-4 h-10 w-10 text-white/28" />
              <p className="mb-2 text-lg font-semibold">No subscriptions yet</p>
              <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-white/42">
                Add a few manually or connect Plaid from the import page so CancelIt can detect recurring charges.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button onClick={() => router.push("/dashboard/import")} className="bg-red-500 text-white hover:bg-red-600">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Connect Plaid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                  className="border-white/12 bg-transparent text-white hover:bg-white/[0.06]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Manually
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="grid gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-colors hover:border-white/[0.13] md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{sub.name}</h3>
                      {sub.category ? <Badge variant="secondary">{sub.category}</Badge> : null}
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/44">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" />
                        Renews {new Date(sub.next_billing_date).toLocaleDateString()}
                      </span>
                      <span className="tabular-nums">
                        ${Number(sub.cost || 0).toFixed(2)} / {sub.billing_cycle}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {sub.website_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={sub.website_url} target="_blank" rel="noreferrer">
                          Open <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancellationRequest(sub)}
                      disabled={requestingId === sub.id || sub.status === "cancelled" || sub.status === "pending_cancellation"}
                      className="border-red-400/25 text-red-200 hover:bg-red-500/10 hover:text-red-100"
                    >
                      {requestingId === sub.id ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <XCircle className="mr-2 h-3.5 w-3.5" />}
                      Request cancellation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cancellationGuide ? (
            <div className="mt-5 rounded-xl border border-red-400/15 bg-red-500/[0.06] p-5">
              <div className="mb-3 flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-red-200" />
                <div>
                  <h3 className="font-semibold">{cancellationGuide.subscriptionName}</h3>
                  <p className="text-sm text-white/48">{cancellationGuide.message}</p>
                </div>
              </div>
              <ol className="space-y-2 pl-8 text-sm leading-6 text-white/62">
                {cancellationGuide.instructions.map((step) => (
                  <li key={step} className="list-decimal">
                    {step}
                  </li>
                ))}
              </ol>
              {cancellationGuide.url ? (
                <Button asChild className="mt-4 bg-red-500 text-white hover:bg-red-600">
                  <a href={cancellationGuide.url} target="_blank" rel="noreferrer">
                    Open cancellation page <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <AddSubscriptionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          setShowAddModal(false)
          loadSubscriptions()
        }}
      />
    </>
  )
}
