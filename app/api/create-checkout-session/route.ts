import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("=== Checkout Session Request Started ===")

    // Check environment variables
    console.log("Environment check:")
    console.log("- STRIPE_SECRET_KEY exists:", !!process.env.STRIPE_SECRET_KEY)
    console.log("- STRIPE_SECRET_KEY starts with sk_:", process.env.STRIPE_SECRET_KEY?.startsWith("sk_"))
    console.log("- NEXT_PUBLIC_SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL)

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("❌ STRIPE_SECRET_KEY is not set")
      return NextResponse.json({ error: "Stripe configuration error. Please contact support." }, { status: 500 })
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
      console.error("❌ STRIPE_SECRET_KEY has wrong format (should start with sk_)")
      return NextResponse.json({ error: "Invalid Stripe configuration. Please contact support." }, { status: 500 })
    }

    // Initialize Stripe
    console.log("Initializing Stripe client...")
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })

    // Parse request body
    const body = await request.json()
    const { priceId } = body
    console.log("Price ID received:", priceId)

    if (!priceId) {
      console.error("❌ No priceId in request")
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    // Get authenticated user
    console.log("Getting authenticated user...")
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.error("❌ Auth error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    if (!user) {
      console.error("❌ No user found")
      return NextResponse.json({ error: "Please sign in to continue" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    // Validate site URL
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error("❌ NEXT_PUBLIC_SITE_URL not set")
      return NextResponse.json({ error: "Site URL configuration error. Please contact support." }, { status: 500 })
    }

    // Test Stripe connection first
    console.log("Testing Stripe connection...")
    try {
      await stripe.prices.retrieve(priceId)
      console.log("✅ Stripe connection successful, price exists")
    } catch (stripeTestError) {
      console.error("❌ Stripe connection test failed:", stripeTestError)
      if (stripeTestError instanceof Stripe.errors.StripeError) {
        console.error("Stripe error details:", {
          type: stripeTestError.type,
          code: stripeTestError.code,
          message: stripeTestError.message,
        })
        return NextResponse.json({ error: `Stripe error: ${stripeTestError.message}` }, { status: 500 })
      }
      throw stripeTestError
    }

    // Create checkout session
    console.log("Creating Stripe checkout session...")
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
      metadata: {
        userId: user.id,
      },
    })

    console.log("✅ Checkout session created:", session.id)

    if (!session.url) {
      console.error("❌ No session URL in response")
      return NextResponse.json({ error: "Failed to generate checkout URL" }, { status: 500 })
    }

    console.log("✅ Returning session URL")
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("=== Checkout Session Error ===")
    console.error("Error details:", error)

    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error type:", error.type)
      console.error("Stripe error code:", error.code)
      console.error("Stripe error message:", error.message)
      console.error("Stripe error raw:", error.raw)

      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
