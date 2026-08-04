import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const planLabels: Record<string, string> = {
  free: "Free",
  minimum: "Starter",
  medium: "Plus",
  maximum: "Unlimited",
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get customer from database
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("stripe_customer_id, stripe_subscription_id, subscription_tier, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (customerError) {
      console.error("Error fetching customer:", customerError)
      return NextResponse.json({ error: "Failed to fetch customer data" }, { status: 500 })
    }

    // If no subscription, return null
    if (!customer?.stripe_subscription_id) {
      return NextResponse.json({
        subscription: null,
      })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      const tier = customer.subscription_tier || "free"

      return NextResponse.json({
        subscription: {
          status: customer.subscription_status || "active",
          tier,
          plan: planLabels[tier] || tier,
          billingPortalAvailable: false,
        },
      })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    // Get subscription details from Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(customer.stripe_subscription_id)
      const tier = customer.subscription_tier || "free"

      return NextResponse.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          tier,
          plan: planLabels[tier] || tier,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          billingPortalAvailable: true,
        },
      })
    } catch (stripeError) {
      console.error("Error fetching subscription from Stripe:", stripeError)
      const tier = customer.subscription_tier || "free"

      // Return database info if Stripe fails
      return NextResponse.json({
        subscription: {
          tier,
          plan: planLabels[tier] || tier,
          status: customer.subscription_status || "inactive",
          billingPortalAvailable: false,
        },
      })
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
