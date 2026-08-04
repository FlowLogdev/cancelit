"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/marketing/reveal"
import { SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"
import { Check, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For trying CancelIt before paying.",
    features: ["Track up to 5 subscriptions", "Plaid scan returns up to 5 matches", "Basic dashboard access"],
    priceId: undefined,
    free: true,
  },
  {
    name: "Starter",
    price: "$4.99",
    description: "For a short personal list and light cleanup.",
    features: ["Track up to 10 subscriptions", "Plaid scan returns up to 10 matches", "Basic spending view", "Renewal reminders"],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MINIMUM,
  },
  {
    name: "Plus",
    price: "$12.99",
    description: "Best for a full scan, cancellation guidance, and savings help.",
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
    description: "For heavy cleanup and ongoing subscription control.",
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
  },
]

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes. You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes. All paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel whenever you want, with no fees. Access continues until the end of your billing period.",
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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push(`/signup?returnTo=/pricing`)
        return
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
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
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(82,38,255,0.2),transparent_32%),linear-gradient(to_bottom,rgba(0,0,0,0.08),#000_60%)]" />
      </div>

      <SiteNav />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-16 text-center sm:px-6 lg:pt-20">
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Simple pricing, real savings.</h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-lg leading-8 text-white/58">
          Plaid detects your recurring charges. Your plan controls how many of them you can track and act on.
        </p>
      </section>

      <Reveal className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 ${
                plan.popular ? "bg-red-500 text-white" : "border border-white/[0.08] bg-[#101010]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-600">
                  Most popular
                </span>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className={`mt-2 text-sm leading-6 ${plan.popular ? "text-white/78" : "text-white/50"}`}>
                  {plan.description}
                </p>
                <p className="mt-6 text-4xl font-black tabular-nums">
                  {plan.price}
                  <span className="text-sm font-medium opacity-70">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className={`mt-8 w-full ${
                  plan.popular ? "bg-white text-red-600 hover:bg-white/90" : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
                }`}
                disabled={loadingPlan !== null}
                onClick={() => (plan.free ? router.push("/signup") : handleSubscribe(plan.priceId, plan.name))}
              >
                {loadingPlan === plan.name ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading
                  </span>
                ) : (
                  `Choose ${plan.name}`
                )}
              </Button>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.1} className="relative z-10 mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 className="text-center text-3xl font-black tracking-tight">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-white/[0.08] rounded-2xl border border-white/[0.08] bg-[#101010]">
          {faqs.map((faq) => (
            <div key={faq.question} className="p-6">
              <h3 className="text-base font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-6 text-white/54">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <SiteFooter />
    </main>
  )
}
