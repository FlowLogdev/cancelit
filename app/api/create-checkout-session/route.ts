import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/route-client"
import {
  type StripePlanConfig,
  getConfiguredStripePlan,
  getConfiguredStripePlanByPriceId,
  getSiteUrl,
  getStripeSecretKey,
  isStripePlanTier,
  isValidStripeSecretKey,
} from "@/lib/stripe/config"

function isActiveMonthlyPrice(price: Stripe.Price) {
  return price.active && price.type === "recurring" && price.recurring?.interval === "month"
}

function isExpectedPlanPrice(price: Stripe.Price, plan: StripePlanConfig) {
  return isActiveMonthlyPrice(price) && price.currency === "usd" && price.unit_amount === plan.unitAmount
}

async function resolveStripePriceId(stripe: Stripe, plan: StripePlanConfig) {
  const configuredId = plan.priceId.trim()

  if (configuredId.startsWith("price_")) {
    await stripe.prices.retrieve(configuredId)
    return configuredId
  }

  if (!configuredId.startsWith("prod_")) {
    throw new Error(`${plan.name} is missing a Stripe price ID. Configure a price_... value in Vercel.`)
  }

  const prices = await stripe.prices.list({
    active: true,
    product: configuredId,
    type: "recurring",
    limit: 100,
  })

  const matchingPrice = prices.data.find((price) => isExpectedPlanPrice(price, plan))
  const monthlyPrice = prices.data.find(isActiveMonthlyPrice)

  const resolvedPrice = matchingPrice || monthlyPrice

  if (!resolvedPrice) {
    throw new Error(
      `${plan.name} is configured with a Stripe product ID, but no active monthly price was found for that product.`,
    )
  }

  return resolvedPrice.id
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = getStripeSecretKey()

    if (!isValidStripeSecretKey(stripeSecretKey)) {
      return NextResponse.json({ error: "Stripe configuration error. Please contact support." }, { status: 500 })
    }

    const siteUrl = getSiteUrl()
    const { priceId, tier } = await request.json()

    const plan = isStripePlanTier(tier) ? getConfiguredStripePlan(tier) : getConfiguredStripePlanByPriceId(priceId)

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

    const resolvedPriceId = await resolveStripePriceId(stripe, plan)

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
          price: resolvedPriceId,
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
