"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SubscriptionTracker } from "@/components/dashboard/subscription-tracker"
import { SmartNotifications } from "@/components/dashboard/smart-notifications"
import { SpendingAnalytics } from "@/components/dashboard/spending-analytics"
import { SecurityPrivacy } from "@/components/dashboard/security-privacy"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { AIChatAssistant } from "@/components/ai/ai-chat-assistant"
import { AddSubscriptionModal } from "@/components/subscriptions/add-subscription-modal"
import { createClient } from "@/lib/supabase/client"
import { getPlanLimits, isAdminEmail, normalizeTier } from "@/lib/plan-limits"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type DashboardTab = "subscriptions" | "analytics" | "notifications" | "security"

function normalizeDashboardTab(tab: string | null): DashboardTab | null {
  if (tab === "subscriptions" || tab === "analytics" || tab === "notifications" || tab === "security") return tab
  if (tab === "alerts") return "notifications"
  if (tab === "export") return "security"
  return null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [tier, setTier] = useState("free")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<DashboardTab>("subscriptions")
  const [showAddSubscription, setShowAddSubscription] = useState(false)
  const [subscriptionRefreshKey, setSubscriptionRefreshKey] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const requestedTab = params.get("tab")

      if (requestedTab === "connect-bank") {
        router.replace("/dashboard/import")
        return
      }

      if (requestedTab === "add-subscription") {
        setActiveTab("subscriptions")
        setShowAddSubscription(true)
      } else {
        const tab = normalizeDashboardTab(requestedTab)
        if (tab) setActiveTab(tab)
      }
    }

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/signin")
          return
        }

        setUser(user)

        const { data: customer } = await supabase
          .from("customers")
          .select("subscription_tier")
          .eq("user_id", user.id)
          .maybeSingle()

        setTier(isAdminEmail(user.email) ? "maximum" : normalizeTier(customer?.subscription_tier))
      } catch {
        router.push("/signin")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab)
    router.replace(`/dashboard?tab=${tab}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const firstName = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there"
  const planLimits = getPlanLimits(tier, user.email)

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Hey, {firstName} 👋
          </h1>
          <p className="text-white/45 mt-1 text-sm">
            Here's an overview of your subscriptions and spending.
          </p>
        </div>

        <QuickActions
          onAddSubscription={() => {
            setActiveTab("subscriptions")
            setShowAddSubscription(true)
          }}
          onSelectTab={handleTabChange}
        />

        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as DashboardTab)} className="mt-8 space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-0 rounded-xl bg-white/[0.05] border border-white/[0.07] p-1">
            {[
              { value: "subscriptions", label: "Subscriptions" },
              { value: "analytics", label: "Analytics" },
              { value: "notifications", label: "Notifications" },
              { value: "security", label: "Security" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 h-8 rounded-lg text-sm font-medium text-white/50
                  data-[state=active]:bg-white/[0.08] data-[state=active]:text-white
                  hover:text-white/80 transition-colors"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="subscriptions">
            <SubscriptionTracker key={subscriptionRefreshKey} />
          </TabsContent>
          <TabsContent value="analytics">
            <SpendingAnalytics />
          </TabsContent>
          <TabsContent value="notifications">
            <SmartNotifications />
          </TabsContent>
          <TabsContent value="security">
            <SecurityPrivacy />
          </TabsContent>
        </Tabs>
      </main>

      <AIChatAssistant isPaidUser={planLimits.aiAssistant} tier={tier} />
      <AddSubscriptionModal
        open={showAddSubscription}
        onOpenChange={setShowAddSubscription}
        onSuccess={() => {
          setShowAddSubscription(false)
          setSubscriptionRefreshKey((key) => key + 1)
          handleTabChange("subscriptions")
        }}
      />
    </div>
  )
}
