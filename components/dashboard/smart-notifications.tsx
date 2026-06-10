"use client"

import { Bell, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SmartNotifications() {
  const notifications = [
    {
      id: 1,
      type: "renewal",
      icon: Calendar,
      title: "Upcoming Renewal",
      description: "Netflix subscription renews in 3 days",
      amount: "$15.99",
      priority: "high",
    },
    {
      id: 2,
      type: "price",
      icon: TrendingUp,
      title: "Price Increase",
      description: "Spotify increased price by $2",
      amount: "+$2.00",
      priority: "medium",
    },
    {
      id: 3,
      type: "savings",
      icon: DollarSign,
      title: "Potential Savings",
      description: "You could save $25/month by switching plans",
      amount: "$25.00",
      priority: "low",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Smart Notifications
        </CardTitle>
        <CardDescription>Stay informed about your subscriptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notification.icon
            return (
              <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div
                  className={`p-2 rounded-lg ${
                    notification.priority === "high"
                      ? "bg-red-100"
                      : notification.priority === "medium"
                        ? "bg-yellow-100"
                        : "bg-green-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      notification.priority === "high"
                        ? "text-red-600"
                        : notification.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <Badge
                      variant={
                        notification.priority === "high"
                          ? "destructive"
                          : notification.priority === "medium"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {notification.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{notification.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{notification.amount}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
