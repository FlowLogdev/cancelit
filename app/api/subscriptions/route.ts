import { createClient } from "@/lib/supabase/route-client"
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
