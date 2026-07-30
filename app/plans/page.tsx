"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowRight, Shield, Zap, Users, TrendingUp, Bell, CreditCard, Download, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface Feature {
  name: string
  free: boolean | string
  minimum: boolean | string
  medium: boolean | string
  maximum: boolean | string
  enterprise: boolean | string
}

const featureCategories = [
  {
    category: "Subscription Tracking",
    icon: CreditCard,
    features: [
      {
        name: "Number of subscriptions",
        free: "Up to 5",
        minimum: "Unlimited",
        medium: "Unlimited",
        maximum: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Manual subscription entry",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Automatic subscription detection",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Recurring payment tracking",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Bill due date reminders",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Banking & Integration",
    icon: Shield,
    features: [
      {
        name: "Bank account integration (Plaid)",
        free: false,
        minimum: "1 account",
        medium: "Up to 5 accounts",
        maximum: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Credit card linking",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Automatic transaction sync",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Multi-currency support",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Custom payment method support",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Analytics & Insights",
    icon: TrendingUp,
    features: [
      {
        name: "Basic spending overview",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Category breakdown charts",
        free: "Basic",
        minimum: "Advanced",
        medium: "Advanced",
        maximum: "Advanced",
        enterprise: "Custom",
      },
      {
        name: "Spending trends analysis",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Cost-saving recommendations",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Yearly savings calculator",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Custom spending categories",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Advanced reporting & dashboards",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Predictive analytics",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Notifications & Alerts",
    icon: Bell,
    features: [
      {
        name: "Email notifications",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Price increase alerts",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Renewal reminders",
        free: "Basic",
        minimum: "Advanced",
        medium: "Advanced",
        maximum: "Advanced",
        enterprise: "Custom",
      },
      {
        name: "SMS notifications",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Push notifications (mobile)",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Slack/Teams integration",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Custom alert rules",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Cancellation Assistance",
    icon: X,
    features: [
      {
        name: "Cancellation guides",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Direct cancellation links",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Email cancellation assistance",
        free: false,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Priority cancellation support",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Dedicated cancellation concierge",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Collaboration & Sharing",
    icon: Users,
    features: [
      {
        name: "Individual account",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Family sharing",
        free: false,
        minimum: false,
        medium: "Up to 4 members",
        maximum: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "Team management",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Role-based access control",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Shared budgets",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
    ],
  },
  {
    category: "Data & Export",
    icon: Download,
    features: [
      {
        name: "Data retention",
        free: "30 days",
        minimum: "1 year",
        medium: "Unlimited",
        maximum: "Unlimited",
        enterprise: "Unlimited",
      },
      {
        name: "CSV export",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "PDF reports",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "API access",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Webhook integrations",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Custom data exports",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Security & Privacy",
    icon: Lock,
    features: [
      {
        name: "Bank-level encryption (256-bit SSL)",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Two-factor authentication (2FA)",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Read-only bank access",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "SOC 2 compliance",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "GDPR compliance",
        free: true,
        minimum: true,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Single Sign-On (SSO)",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Custom security policies",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "On-premise deployment option",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Support",
    icon: Zap,
    features: [
      {
        name: "Email support",
        free: "Community",
        minimum: "Email",
        medium: "Priority Email",
        maximum: "Priority Email",
        enterprise: "24/7 Dedicated",
      },
      {
        name: "Response time",
        free: "48 hours",
        minimum: "24 hours",
        medium: "12 hours",
        maximum: "4 hours",
        enterprise: "1 hour",
      },
      {
        name: "Live chat support",
        free: false,
        minimum: false,
        medium: true,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Phone support",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Dedicated account manager",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Custom onboarding",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Training sessions",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
  {
    category: "Customization",
    icon: Zap,
    features: [
      {
        name: "Custom branding",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "White-label options",
        free: false,
        minimum: false,
        medium: false,
        maximum: true,
        enterprise: true,
      },
      {
        name: "Custom integrations",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Custom features development",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
      {
        name: "Custom SLA agreements",
        free: false,
        minimum: false,
        medium: false,
        maximum: false,
        enterprise: true,
      },
    ],
  },
]

const pricingTiers = [
  { id: "free", name: "Free", price: "$0", period: "forever", popular: false },
  { id: "minimum", name: "Starter", price: "$4.99", period: "month", popular: false },
  { id: "medium", name: "Plus", price: "$12.99", period: "month", popular: true },
  { id: "maximum", name: "Unlimited", price: "$19.99", period: "month", popular: false },
  { id: "enterprise", name: "Enterprise", price: "Custom", period: "pricing", popular: false },
]

export default function PlansPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>("medium")

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-600 mx-auto" />
      )
    }
    return <span className="text-sm text-gray-300">{value}</span>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <CancelItLogo imageClassName="h-9 w-9" />
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push("/pricing")}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                View Pricing
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Compare <span className="text-red-600">All Features</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Find the perfect plan for your needs. From basic tracking to enterprise-grade management, we've got you
            covered.
          </p>
        </div>

        {/* Quick Pricing Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.id}
              className={`relative bg-gray-900 border-gray-800 text-white cursor-pointer transition-all hover:scale-105 ${
                selectedPlan === tier.id ? "ring-2 ring-red-600" : ""
              } ${tier.popular ? "ring-2 ring-red-600" : ""}`}
              onClick={() => setSelectedPlan(tier.id)}
            >
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 text-white">
                  Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && <span className="text-gray-400 text-sm">/{tier.period}</span>}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="space-y-12">
          {featureCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <div key={categoryIndex}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">{category.category}</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-4 font-semibold text-gray-300 w-1/3">Feature</th>
                        {pricingTiers.map((tier) => (
                          <th
                            key={tier.id}
                            className={`text-center py-4 px-4 font-semibold ${
                              selectedPlan === tier.id ? "bg-gray-800" : ""
                            } ${tier.popular ? "bg-gray-800/50" : ""}`}
                          >
                            {tier.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="border-b border-gray-800 hover:bg-gray-900/50">
                          <td className="py-4 px-4 text-gray-300">{feature.name}</td>
                          <td className={`py-4 px-4 text-center ${selectedPlan === "free" ? "bg-gray-800" : ""}`}>
                            {renderFeatureValue(feature.free)}
                          </td>
                          <td className={`py-4 px-4 text-center ${selectedPlan === "minimum" ? "bg-gray-800" : ""}`}>
                            {renderFeatureValue(feature.minimum)}
                          </td>
                          <td
                            className={`py-4 px-4 text-center bg-gray-800/50 ${selectedPlan === "medium" ? "bg-gray-800" : ""}`}
                          >
                            {renderFeatureValue(feature.medium)}
                          </td>
                          <td className={`py-4 px-4 text-center ${selectedPlan === "maximum" ? "bg-gray-800" : ""}`}>
                            {renderFeatureValue(feature.maximum)}
                          </td>
                          <td className={`py-4 px-4 text-center ${selectedPlan === "enterprise" ? "bg-gray-800" : ""}`}>
                            {renderFeatureValue(feature.enterprise)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-red-600 to-red-800 border-0 max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white mb-4">Ready to Get Started?</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                Choose the plan that's right for you and start saving money today.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center space-x-4 pb-8">
              <Button
                size="lg"
                className="bg-white text-red-600 hover:bg-gray-100"
                onClick={() => router.push("/pricing")}
              >
                View Pricing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent"
                onClick={() => router.push("/signup")}
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-4xl font-bold text-center mb-12">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">What's included in the Free plan?</h3>
              <p className="text-gray-400">
                The Free plan includes tracking up to 5 subscriptions, basic spending insights, email notifications, and
                manual entry. Perfect for getting started!
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">Can I upgrade or downgrade anytime?</h3>
              <p className="text-gray-400">
                Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the
                end of your billing cycle.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">Is my banking data secure?</h3>
              <p className="text-gray-400">
                Absolutely. We use bank-level 256-bit SSL encryption, Plaid for secure connections, and never store your
                banking credentials. Your data is read-only.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">What makes Enterprise different?</h3>
              <p className="text-gray-400">
                Enterprise includes custom pricing, dedicated support, on-premise deployment, custom features, SSO,
                advanced security, and a dedicated account manager.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">Do you offer a money-back guarantee?</h3>
              <p className="text-gray-400">
                Yes! We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, we'll refund
                your payment, no questions asked.
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="font-semibold text-xl mb-3 text-red-400">Can I cancel my subscription anytime?</h3>
              <p className="text-gray-400">
                Yes, you can cancel anytime from your settings page. Your subscription remains active until the end of
                your billing period, and you won't be charged again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
