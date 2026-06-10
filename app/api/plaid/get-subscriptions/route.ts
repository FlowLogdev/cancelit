import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
})

const plaidClient = new PlaidApi(configuration)

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
    const { itemId } = body

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

    // Get transactions from the last 6 months
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 6)

    const response = await plaidClient.transactionsGet({
      access_token: plaidItem.access_token,
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
        const amounts = transactions.map((t) => t.amount)
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length

        return {
          merchant_name: merchant,
          amount: avgAmount,
          frequency: "monthly", // Simplified - could be calculated
          last_payment_date: transactions[0].date,
          transaction_count: transactions.length,
        }
      })

    return NextResponse.json({
      subscriptions: detectedSubscriptions,
      transaction_count: transactions.length,
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
