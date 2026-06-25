import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(request: Request) {
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

    const body = await request.json()
    const { email } = body

    // Verify email matches user's email
    if (email !== user.email) {
      return NextResponse.json({ error: "Email does not match" }, { status: 400 })
    }

    // Get customer from database
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("stripe_subscription_id, stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (customerError || !customer?.stripe_subscription_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 })
    }

    // Cancel the subscription at period end in Stripe
    const subscription = await stripe.subscriptions.update(customer.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Update customer record in database
    await supabase
      .from("customers")
      .update({
        subscription_status: "canceling",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    return NextResponse.json({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
      subscription: {
        id: subscription.id,
        cancel_at: subscription.cancel_at,
        current_period_end: subscription.current_period_end,
      },
    })
  } catch (error: any) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to cancel subscription",
      },
      { status: 500 },
    )
  }
}
