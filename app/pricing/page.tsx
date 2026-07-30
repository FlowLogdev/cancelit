"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For trying CancelIt before paying",
    features: ["Track up to 5 subscriptions", "Plaid scan returns up to 5 matches", "Basic dashboard access"],
    priceId: undefined,
    popular: false,
    free: true,
  },
  {
    name: "Starter",
    price: "$4.99",
    period: "/month",
    description: "For a short personal list and light cleanup",
    features: ["Track up to 10 subscriptions", "Plaid scan returns up to 10 matches", "Basic spending view", "Renewal reminders"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MINIMUM,
    popular: false,
  },
  {
    name: "Plus",
    price: "$12.99",
    period: "/month",
    description: "Best for a full scan, cancellation guidance, and savings help",
    features: [
      "Track up to 50 subscriptions",
      "Plaid scan returns up to 50 matches",
      "Savings assistant",
      "Cancellation guidance",
      "Renewal priority queue",
      "Export reports",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MEDIUM,
    popular: true,
  },
  {
    name: "Unlimited",
    price: "$19.99",
    period: "/month",
    description: "For heavy cleanup and ongoing subscription control",
    features: [
      "Unlimited subscription tracking",
      "Unlimited Plaid-detected matches",
      "AI-powered insights",
      "Priority support",
      "Advanced reporting",
      "Custom categories",
      "Team-ready exports",
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM,
    popular: false,
  },
]

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubscribe = async (priceId: string | undefined, planName: string) => {
    if (!priceId) {
      alert("This plan is not configured yet. Please contact support.")
      return
    }

    try {
      setLoadingPlan(planName)

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to signup with return URL
        router.push(`/signup?returnTo=/pricing`)
        return
      }

      console.log("Creating checkout session for:", planName)
      console.log("Price ID:", priceId)

      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()
      console.log("Checkout session response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert(error instanceof Error ? error.message : "Failed to start checkout. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <CancelItLogo
            href="/"
            className="mb-6 justify-center"
            imageClassName="h-12 w-12 rounded-xl"
            textClassName="text-2xl text-gray-900"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Plaid can detect recurring charges, but each plan controls how many matches you can manage.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "border-2 border-red-500 shadow-lg shadow-red-500/10" : "border border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-red-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${plan.popular ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={() => (plan.free ? router.push("/signup") : handleSubscribe(plan.priceId, plan.name))}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.name ? "Loading..." : plan.free ? "Start Free" : "Get Started"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next
                billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards including Visa, Mastercard, and American Express.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! All plans come with a 14-day free trial. No credit card required to start your trial.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Absolutely. You can cancel your subscription at any time with no cancellation fees. Your access
                continues until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
