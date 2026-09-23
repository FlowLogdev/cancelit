import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

type RevenueCatEvent = {
  app_user_id?: string
  aliases?: string[]
  original_app_user_id?: string
  product_id?: string
  entitlement_ids?: string[]
  type?: string
  expiration_at_ms?: number | null
}

function tierFor(event: RevenueCatEvent) {
  const productToTier: Record<string, "minimum" | "medium" | "maximum"> = {
    [process.env.REVENUECAT_PRODUCT_MINIMUM || "cancelit_starter_monthly"]: "minimum",
    [process.env.REVENUECAT_PRODUCT_MEDIUM || "cancelit_plus_monthly"]: "medium",
    [process.env.REVENUECAT_PRODUCT_MAXIMUM || "cancelit_unlimited_monthly"]: "maximum",
  }

  const entitlementToTier: Record<string, "minimum" | "medium" | "maximum"> = {
    minimum: "minimum",
    medium: "medium",
    maximum: "maximum",
  }

  return productToTier[event.product_id || ""] || event.entitlement_ids?.map((id) => entitlementToTier[id]).find(Boolean)
}

export async function POST(request: Request) {
  const expectedAuthorization = process.env.REVENUECAT_WEBHOOK_AUTHORIZATION
  if (!expectedAuthorization || request.headers.get("authorization") !== expectedAuthorization) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("RevenueCat webhook is missing Supabase server credentials")
    return NextResponse.json({ error: "Server configuration error" }, { status: 503 })
  }

  try {
    const body = await request.json()
    const event = (body.event || body) as RevenueCatEvent
    const userId = event.app_user_id || event.original_app_user_id || event.aliases?.[0]

    if (!userId) {
      return NextResponse.json({ error: "RevenueCat event has no app user ID" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const hasExpired = event.type === "EXPIRATION" || event.type === "SUBSCRIPTION_PAUSED"
    const cancellationHasEnded =
      event.type === "CANCELLATION" && (!event.expiration_at_ms || event.expiration_at_ms <= Date.now())
    const isInactive = hasExpired || cancellationHasEnded
    const tier = isInactive ? "free" : tierFor(event)

    // Ignore non-entitlement events such as transfers and test events. They must not downgrade access.
    if (!tier) return NextResponse.json({ received: true, ignored: true })

    const { error } = await supabase
      .from("customers")
      .update({
        subscription_tier: tier,
        subscription_status: isInactive ? "cancelled" : "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("RevenueCat customer update failed", error)
      return NextResponse.json({ error: "Unable to update customer" }, { status: 500 })
    }

    return NextResponse.json({ received: true, tier })
  } catch (error) {
    console.error("RevenueCat webhook failed", error)
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
  }
}
