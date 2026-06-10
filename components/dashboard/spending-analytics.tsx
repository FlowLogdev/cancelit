"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, Filter } from "lucide-react"

interface SpendingAnalyticsProps {
  subscriptions?: any[]
}

export function SpendingAnalytics({ subscriptions = [] }: SpendingAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("6months")

  const monthlySpending = [
    { month: "Jul", amount: 89.97 },
    { month: "Aug", amount: 94.96 },
    { month: "Sep", amount: 78.98 },
    { month: "Oct", amount: 102.95 },
    { month: "Nov", amount: 87.97 },
    { month: "Dec", amount: 91.96 },
  ]

  const categorySpending = [
    { name: "Entertainment", value: 45.97, color: "#8884d8" },
    { name: "Software", value: 52.99, color: "#82ca9d" },
    { name: "Music", value: 9.99, color: "#ffc658" },
    { name: "News", value: 12.99, color: "#ff7300" },
    { name: "Fitness", value: 19.99, color: "#00ff88" },
  ]

  const yearOverYear = [
    { month: "Jan", thisYear: 85, lastYear: 92 },
    { month: "Feb", thisYear: 89, lastYear: 88 },
    { month: "Mar", thisYear: 94, lastYear: 95 },
    { month: "Apr", thisYear: 78, lastYear: 85 },
    { month: "May", thisYear: 102, lastYear: 98 },
    { month: "Jun", thisYear: 87, lastYear: 90 },
  ]

  const insights = [
    {
      type: "savings",
      title: "Great Progress!",
      description: "You've saved $127 compared to last year",
      trend: "positive",
      value: "$127",
    },
    {
      type: "warning",
      title: "Spending Increase",
      description: "Entertainment spending is up 23% this month",
      trend: "negative",
      value: "+23%",
    },
    {
      type: "info",
      title: "Most Expensive Category",
      description: "Software subscriptions account for 37% of your spending",
      trend: "neutral",
      value: "37%",
    },
  ]

  const totalSpending = monthlySpending.reduce((sum, month) => sum + month.amount, 0)
  const averageMonthly = totalSpending / monthlySpending.length
  const lastMonthChange =
    monthlySpending.length > 1
      ? ((monthlySpending[monthlySpending.length - 1].amount - monthlySpending[monthlySpending.length - 2].amount) /
          monthlySpending[monthlySpending.length - 2].amount) *
        100
      : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending (6mo)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">${averageMonthly.toFixed(2)} average per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Month-over-Month</CardTitle>
            {lastMonthChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lastMonthChange >= 0 ? "text-red-600" : "text-green-600"}`}>
              {lastMonthChange >= 0 ? "+" : ""}
              {lastMonthChange.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs previous month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categorySpending.length}</div>
            <p className="text-xs text-muted-foreground">across {categorySpending.length} categories</p>
          </CardContent>
        </Card>

        {/* Updated code here */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Total
            </CardTitle>
            <CardDescription>Current month spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$245.67</div>
            <p className="text-sm text-gray-600 mt-2">Across 12 subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              vs Last Month
            </CardTitle>
            <CardDescription>Month over month change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">+$23.45</div>
            <p className="text-sm text-gray-600 mt-2">10.5% increase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Potential Savings
            </CardTitle>
            <CardDescription>By optimizing subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">$45.00</div>
            <p className="text-sm text-gray-600 mt-2">18% savings possible</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Spending Analytics</CardTitle>
              <CardDescription>Detailed breakdown of your subscription spending</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="space-y-4">
            <TabsList>
              <TabsTrigger value="monthly">Monthly Trend</TabsTrigger>
              <TabsTrigger value="category">By Category</TabsTrigger>
              <TabsTrigger value="comparison">Year Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="category" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySpending}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Category Breakdown</h4>
                  {categorySpending.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="font-medium">${category.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearOverYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="thisYear" stroke="#3b82f6" name="This Year" />
                    <Line type="monotone" dataKey="lastYear" stroke="#94a3b8" name="Last Year" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Smart Insights</CardTitle>
          <CardDescription>AI-powered recommendations based on your spending patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    insight.trend === "positive"
                      ? "bg-green-500"
                      : insight.trend === "negative"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge
                      variant={
                        insight.trend === "positive"
                          ? "default"
                          : insight.trend === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {insight.value}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
