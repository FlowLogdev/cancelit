import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/route-client"

const configuredPlans = [
  {
    tier: "minimum",
    name: "Starter",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MINIMUM,
  },
  {
    tier: "medium",
    name: "Plus",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MEDIUM,
  },
  {
    tier: "maximum",
    name: "Unlimited",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM,
  },
]

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_")) {
      return NextResponse.json({ error: "Stripe configuration error. Please contact support." }, { status: 500 })
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json({ error: "Site URL configuration error. Please contact support." }, { status: 500 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    const plan = configuredPlans.find((candidate) => candidate.priceId === priceId)

    if (!plan) {
      return NextResponse.json({ error: "This Stripe price is not configured for a CancelIt plan." }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    await stripe.prices.retrieve(priceId)

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
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
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
