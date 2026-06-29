import { createClient } from "@/lib/supabase/route-client"
import { formatLimit, getPlanLimits, normalizeTier } from "@/lib/plan-limits"
import { NextResponse } from "next/server"

type ImportSubscription = {
  merchant_name?: string
  merchantName?: string
  amount?: number
  frequency?: "weekly" | "monthly" | "yearly"
  last_payment_date?: string
  lastCharge?: string
  next_billing_date?: string
  category?: string
}

function nextBillingDate(lastPaymentDate?: string, frequency: "weekly" | "monthly" | "yearly" = "monthly") {
  const date = lastPaymentDate ? new Date(`${lastPaymentDate}T00:00:00`) : new Date()

  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0]
  }

  const now = new Date()
  while (date <= now) {
    if (frequency === "weekly") date.setDate(date.getDate() + 7)
    if (frequency === "monthly") date.setMonth(date.getMonth() + 1)
    if (frequency === "yearly") date.setFullYear(date.getFullYear() + 1)
  }

  return date.toISOString().split("T")[0]
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

    const { subscriptions } = (await request.json()) as { subscriptions?: ImportSubscription[] }

    if (!subscriptions?.length) {
      return NextResponse.json({ error: "Choose at least one subscription to import." }, { status: 400 })
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

    const remaining = Number.isFinite(limits.trackedSubscriptions)
      ? Math.max(limits.trackedSubscriptions - (existingSubscriptionCount || 0), 0)
      : Number.POSITIVE_INFINITY

    if (remaining <= 0) {
      return NextResponse.json(
        {
          error: `Your ${tier} plan is already at its ${formatLimit(limits.trackedSubscriptions)} subscription limit.`,
          tier,
          plan_limit: formatLimit(limits.trackedSubscriptions),
        },
        { status: 402 },
      )
    }

    const limited = Number.isFinite(remaining) ? subscriptions.slice(0, remaining) : subscriptions
    const rows = limited
      .map((subscription) => {
        const name = subscription.merchant_name || subscription.merchantName
        const amount = Number(subscription.amount || 0)
        const frequency = subscription.frequency || "monthly"

        if (!name || amount <= 0) return null

        return {
          user_id: user.id,
          name,
          amount,
          cost: amount,
          billing_cycle: frequency,
          next_billing_date:
            subscription.next_billing_date || nextBillingDate(subscription.last_payment_date || subscription.lastCharge, frequency),
          status: "active",
          category: subscription.category || "Detected by Plaid",
          notes: "Imported from Plaid transaction analysis.",
        }
      })
      .filter(Boolean)

    if (!rows.length) {
      return NextResponse.json({ error: "No valid subscriptions were selected." }, { status: 400 })
    }

    const { data, error } = await supabase.from("subscriptions").insert(rows).select()

    if (error) {
      console.error("Error importing Plaid subscriptions:", error)
      return NextResponse.json({ error: "Failed to import subscriptions." }, { status: 500 })
    }

    return NextResponse.json({
      imported_count: data?.length || 0,
      skipped_count: subscriptions.length - (data?.length || 0),
      tier,
      plan_limit: formatLimit(limits.trackedSubscriptions),
    })
  } catch (error) {
    console.error("Error importing subscriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
