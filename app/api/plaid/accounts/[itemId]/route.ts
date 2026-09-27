import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"
import { plaidClient } from "@/lib/plaid"

type StoredPlaidItem = {
  access_token: string
  institution_name: string | null
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
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

    const { itemId } = await params
    if (!itemId) {
      return NextResponse.json({ error: "Plaid item ID is required" }, { status: 400 })
    }

    // Generated database types predate the Plaid tables. Keep this contained until types are regenerated.
    const plaidDb = supabase as any
    const { data: item, error: itemError } = await plaidDb
      .from("plaid_items")
      .select("access_token,institution_name")
      .eq("item_id", itemId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (itemError) {
      console.error("Error loading Plaid connection for removal:", itemError)
      return NextResponse.json({ error: "Failed to load the bank connection" }, { status: 500 })
    }

    if (!item) {
      return NextResponse.json({ error: "Bank connection not found" }, { status: 404 })
    }

    const storedItem = item as StoredPlaidItem

    // Revoke at Plaid first. Only remove the local record after the provider confirms removal.
    await plaidClient.itemRemove({ access_token: storedItem.access_token })

    const { error: deleteError } = await plaidDb
      .from("plaid_items")
      .delete()
      .eq("item_id", itemId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting Plaid connection:", deleteError)
      return NextResponse.json({ error: "Plaid access was revoked, but the local connection could not be removed" }, { status: 500 })
    }

    return NextResponse.json({
      deleted: true,
      institution: storedItem.institution_name || "Bank connection",
      subscriptionsRetained: true,
    })
  } catch (error: any) {
    const message = error?.response?.data?.error_message || error?.message || "Failed to unlink bank connection"
    console.error("Error unlinking Plaid connection:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
