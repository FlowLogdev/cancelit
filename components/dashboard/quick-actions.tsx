"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, CreditCard, Bell, BarChart3, Settings, Download, Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()
  const [recentActions] = useState([
    { id: "1", action: "Added Netflix subscription", time: "2 hours ago" },
    { id: "2", action: "Cancelled Adobe subscription", time: "1 day ago" },
    { id: "3", action: "Updated Spotify billing", time: "3 days ago" },
  ])

  const quickActions = [
    {
      title: "Add Subscription",
      description: "Manually add a new subscription",
      icon: <Plus className="h-4 w-4" />,
      action: () => console.log("Open add subscription modal"),
    },
    {
      title: "Connect Bank",
      description: "Link your bank account via Plaid",
      icon: <CreditCard className="h-4 w-4" />,
      action: () => router.push("/dashboard?tab=connect-bank"),
    },
    {
      title: "Analytics",
      description: "See spending insights",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => router.push("/dashboard?tab=analytics"),
    },
    {
      title: "Alerts",
      description: "Configure notifications",
      icon: <Bell className="h-4 w-4" />,
      action: () => router.push("/dashboard?tab=alerts"),
    },
    {
      title: "Export",
      description: "Download your data",
      icon: <Download className="h-4 w-4" />,
      action: () => console.log("Export data"),
    },
    {
      title: "Settings",
      description: "Account preferences",
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push("/settings"),
    },
  ]

  const suggestions = [
    {
      title: "Review Unused Subscriptions",
      description: "You have 2 subscriptions you haven't used in 30 days",
      badge: "Action Needed",
      badgeVariant: "destructive" as const,
    },
    {
      title: "Set Up Price Alerts",
      description: "Get notified when subscription prices change",
      badge: "Recommended",
      badgeVariant: "default" as const,
    },
    {
      title: "Enable Auto-Cancel",
      description: "Automatically cancel subscriptions after free trials",
      badge: "Pro Feature",
      badgeVariant: "secondary" as const,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Quick action buttons */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={action.action}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500/15 transition-colors">
              {action.icon}
            </div>
            <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors text-center leading-tight">
              {action.title}
            </span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Smart Suggestions */}
        <Card className="bg-[#0A0A0A] border-white/[0.07]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Smart Suggestions</CardTitle>
            <CardDescription className="text-white/40 text-sm">
              Personalized recommendations to save money
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-white/[0.06] hover:border-white/[0.1] bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="font-medium text-sm">{s.title}</h4>
                    <Badge variant={s.badgeVariant} className="text-xs ml-2 flex-shrink-0">
                      {s.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-white/40">{s.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="bg-[#0A0A0A] border-white/[0.07]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Month</CardTitle>
            <CardDescription className="text-white/40 text-sm">
              Quick overview of your subscription activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Money Saved", value: "+$45.99", color: "text-green-400" },
                { label: "Subscriptions Added", value: "2", color: "text-white" },
                { label: "Subscriptions Cancelled", value: "3", color: "text-white" },
                { label: "Upcoming Renewals", value: "5", color: "text-yellow-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white/50">{row.label}</span>
                  <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-white/[0.06]">
              <div className="text-xs text-white/30 mb-2">Recent Activity</div>
              <div className="space-y-2">
                {recentActions.map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 flex-shrink-0" />
                    <span className="text-white/60 flex-1">{a.action}</span>
                    <span className="text-white/30">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
