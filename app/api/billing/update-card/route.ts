import { createClient } from "@/lib/supabase/server"
import { getSiteUrl, getStripeSecretKey, isValidStripeSecretKey } from "@/lib/stripe/config"
import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST() {
  try {
    const stripeSecretKey = getStripeSecretKey()

    if (!isValidStripeSecretKey(stripeSecretKey)) {
      return NextResponse.json(
        {
          error:
            "Billing portal is not connected yet. Please choose a plan or contact support to update your payment method.",
        },
        { status: 503 },
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
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
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single()

    if (customerError || !customer?.stripe_customer_id) {
      return NextResponse.json({ error: "No paid subscription found. Choose a plan first." }, { status: 404 })
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${getSiteUrl()}/settings`,
    })

    return NextResponse.json({
      url: session.url,
    })
  } catch (error: any) {
    console.error("Error creating billing portal session:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to create billing portal session",
      },
      { status: 500 },
    )
  }
}
