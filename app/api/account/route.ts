import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

import type { Database } from "@/lib/database.types"
import { plaidClient } from "@/lib/plaid"
import { createClient as createRouteClient } from "@/lib/supabase/route-client"

export const runtime = "nodejs"

type StoredPlaidItem = {
  access_token: string
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) return null

  return createSupabaseAdminClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function DELETE() {
  try {
    const supabase = await createRouteClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()
    if (!admin) {
      console.error("Account deletion is not configured: missing Supabase server credentials")
      return NextResponse.json({ error: "Account deletion is temporarily unavailable. Please try again later." }, { status: 503 })
    }

    // The generated types predate the Plaid tables. Keep this narrow cast contained.
    const plaidDb = supabase as any
    const { data: items, error: itemsError } = await plaidDb
      .from("plaid_items")
      .select("access_token")
      .eq("user_id", user.id)

    if (itemsError) {
      console.error("Failed to load Plaid connections before account deletion:", itemsError)
      return NextResponse.json({ error: "Could not prepare your bank connections for deletion. Please try again." }, { status: 500 })
    }

    const plaidItems = (items ?? []) as StoredPlaidItem[]
    if (plaidItems.length > 0) {
      if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
        return NextResponse.json({ error: "Could not revoke your bank connections. Please try again later." }, { status: 503 })
      }

      for (const item of plaidItems) {
        await plaidClient.itemRemove({ access_token: item.access_token })
      }
    }

    // Support tickets contain contact details, so remove them explicitly. The rest of the
    // customer data is linked to auth.users with ON DELETE CASCADE in the production schema.
    const { error: ticketError } = await admin.from("support_tickets").delete().eq("user_id", user.id)
    if (ticketError) {
      console.error("Failed to remove support tickets during account deletion:", ticketError)
      return NextResponse.json({ error: "Could not delete your account data. Please try again." }, { status: 500 })
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error("Failed to delete Supabase user:", deleteError)
      return NextResponse.json({ error: "Could not delete your account. Please try again." }, { status: 500 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("Unexpected account deletion error:", error)
    return NextResponse.json({ error: "Could not delete your account. Please try again." }, { status: 500 })
  }
}
