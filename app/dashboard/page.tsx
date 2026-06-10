"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SubscriptionTracker } from "@/components/dashboard/subscription-tracker"
import { SmartNotifications } from "@/components/dashboard/smart-notifications"
import { SpendingAnalytics } from "@/components/dashboard/spending-analytics"
import { SecurityPrivacy } from "@/components/dashboard/security-privacy"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
      } catch {
        router.push("/signin")
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [router, supabase.auth])

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

        <QuickActions />

        <Tabs defaultValue="subscriptions" className="mt-8 space-y-6">
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
            <SubscriptionTracker />
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
    </div>
  )
}
