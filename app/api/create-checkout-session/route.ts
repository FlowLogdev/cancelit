import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/route-client"

type PlanTier = "minimum" | "medium" | "maximum"

const configuredPlans: Array<{ tier: PlanTier; name: string; priceId: string }> = [
  {
    tier: "minimum",
    name: "Starter",
    priceId: readEnvValue("STRIPE_PRICE_MINIMUM") || readEnvValue("NEXT_PUBLIC_STRIPE_PRICE_MINIMUM"),
  },
  {
    tier: "medium",
    name: "Plus",
    priceId: readEnvValue("STRIPE_PRICE_MEDIUM") || readEnvValue("NEXT_PUBLIC_STRIPE_PRICE_MEDIUM"),
  },
  {
    tier: "maximum",
    name: "Unlimited",
    priceId: readEnvValue("STRIPE_PRICE_MAXIMUM") || readEnvValue("NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM"),
  },
]

function readEnvValue(key: string) {
  const rawValue = process.env[key]

  if (!rawValue) {
    return ""
  }

  let value = rawValue.trim()

  if (value.startsWith(`${key}=`)) {
    value = value.slice(key.length + 1).trim()
  }

  return value.replace(/^['"]|['"]$/g, "").trim()
}

function getStripeSecretKey() {
  return readEnvValue("STRIPE_SECRET_KEY")
}

function getSiteUrl() {
  return readEnvValue("NEXT_PUBLIC_SITE_URL") || "https://cancelit.app"
}

function isPlanTier(value: unknown): value is PlanTier {
  return value === "minimum" || value === "medium" || value === "maximum"
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = getStripeSecretKey()

    if (!stripeSecretKey.startsWith("sk_")) {
      return NextResponse.json({ error: "Stripe configuration error. Please contact support." }, { status: 500 })
    }

    const siteUrl = getSiteUrl()
    const { priceId, tier } = await request.json()

    const plan = isPlanTier(tier)
      ? configuredPlans.find((candidate) => candidate.tier === tier)
      : configuredPlans.find((candidate) => candidate.priceId === priceId)

    if (!plan?.priceId) {
      return NextResponse.json({ error: "This Stripe plan is not configured yet. Please contact support." }, { status: 500 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 })
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    })

    await stripe.prices.retrieve(plan.priceId)

    const metadata = {
      userId: user.id,
      plan_id: plan.tier,
      plan_name: plan.name,
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
      customer_email: user.email,
      client_reference_id: user.id,
      metadata,
      subscription_data: {
        metadata,
      },
    })

    if (!session.url) {
      return NextResponse.json({ error: "Failed to generate checkout URL" }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout session error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
