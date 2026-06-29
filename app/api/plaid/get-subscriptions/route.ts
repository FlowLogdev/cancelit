import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"
import { formatLimit, getPlanLimits, normalizeTier } from "@/lib/plan-limits"

const plaidEnv = process.env.PLAID_ENV || "sandbox"

const configuration = new Configuration({
  basePath: PlaidEnvironments[plaidEnv as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

const normalizeFrequency = (frequency?: string | null) => {
  const value = String(frequency || "monthly").toUpperCase()

  if (value.includes("WEEK")) return "weekly"
  if (value.includes("YEAR") || value.includes("ANNUAL")) return "yearly"
  return "monthly"
}

const getPlaidError = (error: any) => ({
  code: error?.response?.data?.error_code,
  message: error?.response?.data?.error_message || error?.message,
})

export async function POST(request: Request) {
  try {
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      return NextResponse.json({ error: "Plaid is not configured yet." }, { status: 503 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, refresh = true } = body

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // Get access token for this item
    const { data: plaidItem, error: itemError } = await supabase
      .from("plaid_items")
      .select("access_token")
      .eq("item_id", itemId)
      .eq("user_id", user.id)
      .single()

    if (itemError || !plaidItem) {
      return NextResponse.json({ error: "Plaid item not found" }, { status: 404 })
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .maybeSingle()

    const customer = customerData as { subscription_tier: string | null } | null
    const tier = normalizeTier(customer?.subscription_tier)
    const limits = getPlanLimits(tier, user.email)

    if (limits.plaidImportLimit <= 0) {
      return NextResponse.json(
        {
          error: "Plaid subscription scanning is available on paid plans.",
          tier,
          plan_limit: 0,
        },
        { status: 402 },
      )
    }

    const { count: existingSubscriptionCount } = await supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    const remainingImportSlots = Number.isFinite(limits.plaidImportLimit)
      ? Math.max(limits.plaidImportLimit - (existingSubscriptionCount || 0), 0)
      : Number.POSITIVE_INFINITY

    // Get transactions from the last 6 months
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 6)

    const item = plaidItem as { access_token: string }

    let refreshStatus: "requested" | "skipped" | "unavailable" = "skipped"
    let recurringSource: "plaid_recurring" | "transaction_grouping" = "transaction_grouping"
    let addOnNotice: string | null = null

    if (refresh) {
      try {
        await plaidClient.transactionsRefresh({
          access_token: item.access_token,
        })
        refreshStatus = "requested"
      } catch (error: any) {
        const plaidError = getPlaidError(error)
        refreshStatus = "unavailable"
        addOnNotice = plaidError.message || "Transactions Refresh is not available yet."
        console.warn("Plaid transactions refresh unavailable:", plaidError)
      }
    }

    try {
      const recurringResponse = await plaidClient.transactionsRecurringGet({
        access_token: item.access_token,
      })

      const detectedSubscriptions = recurringResponse.data.outflow_streams
        .filter((stream) => stream.is_active !== false && stream.status !== "TOMBSTONED")
        .map((stream) => {
          const merchant = stream.merchant_name || stream.description
          const amount = Number(stream.last_amount?.amount || stream.average_amount?.amount || 0)

          return {
            id: stream.stream_id,
            merchant_name: merchant,
            merchantName: merchant,
            amount,
            frequency: normalizeFrequency(stream.frequency),
            last_payment_date: stream.last_date,
            lastCharge: stream.last_date,
            next_billing_date: stream.predicted_next_date,
            transaction_count: stream.transaction_ids?.length || 0,
            category:
              stream.personal_finance_category?.primary ||
              stream.category?.[0] ||
              "Recurring charge",
            confidence: stream.status === "MATURE" ? "high" : "medium",
          }
        })
        .filter((subscription) => subscription.merchant_name && subscription.amount > 0)
        .sort((a, b) => b.amount - a.amount)

      const limitedSubscriptions = Number.isFinite(remainingImportSlots)
        ? detectedSubscriptions.slice(0, remainingImportSlots)
        : detectedSubscriptions

      recurringSource = "plaid_recurring"

      return NextResponse.json({
        subscriptions: limitedSubscriptions,
        detected_count: detectedSubscriptions.length,
        returned_count: limitedSubscriptions.length,
        transaction_count: detectedSubscriptions.reduce((total, subscription) => total + subscription.transaction_count, 0),
        tier,
        plan_limit: formatLimit(limits.plaidImportLimit),
        existing_subscription_count: existingSubscriptionCount || 0,
        limit_reached: Number.isFinite(remainingImportSlots) && detectedSubscriptions.length > remainingImportSlots,
        source: recurringSource,
        refresh_status: refreshStatus,
        add_on_notice: addOnNotice,
      })
    } catch (error: any) {
      const plaidError = getPlaidError(error)
      addOnNotice = plaidError.message || "Recurring Transactions is not available yet, so CancelIt used transaction grouping."
      console.warn("Plaid recurring transactions unavailable:", plaidError)
    }

    const response = await plaidClient.transactionsGet({
      access_token: item.access_token,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    })

    // Filter for potential recurring transactions
    const transactions = response.data.transactions
    const recurringTransactions = transactions.filter(
      (t) => t.payment_channel === "online" && t.amount > 0 && t.merchant_name,
    )

    // Group by merchant to detect subscriptions
    const merchantGroups = new Map<string, any[]>()
    recurringTransactions.forEach((t) => {
      const merchant = t.merchant_name || t.name
      if (!merchantGroups.has(merchant)) {
        merchantGroups.set(merchant, [])
      }
      merchantGroups.get(merchant)!.push(t)
    })

    // Detect subscriptions (merchants with multiple similar transactions)
    const detectedSubscriptions = Array.from(merchantGroups.entries())
      .filter(([_, transactions]) => transactions.length >= 2)
      .map(([merchant, transactions]) => {
        const sortedTransactions = [...transactions].sort((a, b) => String(b.date).localeCompare(String(a.date)))
        const amounts = sortedTransactions.map((t) => t.amount)
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
        const firstTransaction = sortedTransactions[0]

        return {
          id: `${merchant}-${firstTransaction.transaction_id}`,
          merchant_name: merchant,
          merchantName: merchant,
          amount: avgAmount,
          frequency: "monthly",
          last_payment_date: firstTransaction.date,
          lastCharge: firstTransaction.date,
          transaction_count: sortedTransactions.length,
          category: firstTransaction.category?.[0] || "Recurring charge",
          confidence: sortedTransactions.length >= 4 ? "high" : "medium",
        }
      })
      .sort((a, b) => b.amount - a.amount)

    const limitedSubscriptions = Number.isFinite(remainingImportSlots)
      ? detectedSubscriptions.slice(0, remainingImportSlots)
      : detectedSubscriptions

    return NextResponse.json({
      subscriptions: limitedSubscriptions,
      detected_count: detectedSubscriptions.length,
      returned_count: limitedSubscriptions.length,
      transaction_count: transactions.length,
      tier,
      plan_limit: formatLimit(limits.plaidImportLimit),
      existing_subscription_count: existingSubscriptionCount || 0,
      limit_reached: Number.isFinite(remainingImportSlots) && detectedSubscriptions.length > remainingImportSlots,
      source: recurringSource,
      refresh_status: refreshStatus,
      add_on_notice: addOnNotice,
    })
  } catch (error: any) {
    console.error("Error getting subscriptions:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to get subscriptions",
      },
      { status: 500 },
    )
  }
}
