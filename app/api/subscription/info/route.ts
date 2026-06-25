import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

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
      .single()

    if (customerError) {
      console.error("Error fetching customer:", customerError)
      return NextResponse.json({ error: "Failed to fetch customer data" }, { status: 500 })
    }

    // If no subscription, return null
    if (!customer.stripe_subscription_id) {
      return NextResponse.json({
        subscription: null,
      })
    }

    // Get subscription details from Stripe
    try {
      const subscription = await stripe.subscriptions.retrieve(customer.stripe_subscription_id)

      return NextResponse.json({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          tier: customer.subscription_tier || "free",
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
      })
    } catch (stripeError) {
      console.error("Error fetching subscription from Stripe:", stripeError)
      // Return database info if Stripe fails
      return NextResponse.json({
        subscription: {
          tier: customer.subscription_tier || "free",
          status: customer.subscription_status || "inactive",
        },
      })
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
