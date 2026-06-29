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

    const { data: items, error: itemsError } = await supabase
      .from("plaid_items")
      .select("id,item_id,institution_id,institution_name,status,error_message,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (itemsError) {
      return NextResponse.json({ error: "Failed to load Plaid connections" }, { status: 500 })
    }

    const itemIds = (items || []).map((item) => item.item_id)
    const { data: accounts, error: accountsError } = itemIds.length
      ? await supabase
          .from("plaid_accounts")
          .select("id,item_id,account_id,account_name,account_mask,account_type,account_subtype,created_at")
          .eq("user_id", user.id)
          .in("item_id", itemIds)
      : { data: [], error: null }

    if (accountsError) {
      return NextResponse.json({ error: "Failed to load Plaid accounts" }, { status: 500 })
    }

    return NextResponse.json({
      items: (items || []).map((item) => ({
        id: item.id,
        itemId: item.item_id,
        institutionId: item.institution_id,
        institutionName: item.institution_name || "Connected institution",
        status: item.status,
        errorMessage: item.error_message,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        accounts: (accounts || [])
          .filter((account) => account.item_id === item.item_id)
          .map((account) => ({
            id: account.id,
            accountId: account.account_id,
            name: account.account_name || "Account",
            mask: account.account_mask,
            type: account.account_type,
            subtype: account.account_subtype,
          })),
      })),
    })
  } catch (error) {
    console.error("Error loading Plaid accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
