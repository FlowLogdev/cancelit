import { createClient } from "@/lib/supabase/route-client"
import { formatLimit, getPlanLimits, normalizeTier } from "@/lib/plan-limits"
import { NextResponse } from "next/server"

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

    const { data, error } = await supabase
      .from("subscriptions")
      .select("id,name,amount,cost,billing_cycle,next_billing_date,status,category,website_url")
      .eq("user_id", user.id)
      .order("next_billing_date", { ascending: true })

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    return NextResponse.json({
      subscriptions: (data || []).map((subscription) => ({
        id: subscription.id,
        name: subscription.name,
        amount: Number(subscription.amount ?? subscription.cost ?? 0),
        billingCycle: subscription.billing_cycle,
        nextBillingDate: subscription.next_billing_date,
        status: subscription.status,
        category: subscription.category,
        websiteUrl: subscription.website_url,
      })),
    })
  } catch (error) {
    console.error("Unexpected subscriptions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const { name, cost, amount, billing_cycle, next_billing_date, status } = body ?? {}

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 })
    }

    const resolvedAmount = Number(cost ?? amount)
    if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 })
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .maybeSingle()

    const tier = normalizeTier(customerData?.subscription_tier)
    const limits = getPlanLimits(tier, user.email)

    const { count: existingSubscriptionCount } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (Number.isFinite(limits.trackedSubscriptions) && (existingSubscriptionCount || 0) >= limits.trackedSubscriptions) {
      return NextResponse.json(
        {
          error: `Your ${tier} plan is already at its ${formatLimit(limits.trackedSubscriptions)} subscription limit.`,
          tier,
          plan_limit: formatLimit(limits.trackedSubscriptions),
        },
        { status: 402 },
      )
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        name,
        cost: resolvedAmount,
        amount: resolvedAmount,
        billing_cycle: billing_cycle || "monthly",
        next_billing_date,
        status: status || "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json({ error: "Failed to add subscription." }, { status: 500 })
    }

    return NextResponse.json({ subscription: data })
  } catch (error) {
    console.error("Unexpected subscription creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
