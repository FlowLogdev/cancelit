import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    const subscription = session.subscription as Stripe.Subscription

    // Update customer record with subscription info
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_tier: session.metadata?.plan_id || session.metadata?.plan_name || "basic",
        subscription_status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating customer subscription:", updateError)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier: session.metadata?.plan_name || "Pro",
        amount: session.amount_total,
      },
    })
  } catch (error: any) {
    console.error("Error verifying payment session:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to verify payment session",
      },
      { status: 500 },
    )
  }
}
