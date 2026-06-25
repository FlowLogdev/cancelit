import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase admin client is not configured" }, { status: 500 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const body = await request.json()
    const { webhook_type, webhook_code, item_id, error } = body

    console.log("Received Plaid webhook:", { webhook_type, webhook_code, item_id })

    // Handle different webhook types
    switch (webhook_type) {
      case "TRANSACTIONS":
        if (webhook_code === "SYNC_UPDATES_AVAILABLE") {
          console.log("Transaction sync needed for item:", item_id)
          // Update item status to indicate sync needed
          await supabase
            .from("plaid_items")
            .update({
              status: "sync_needed",
              updated_at: new Date().toISOString(),
            })
            .eq("item_id", item_id)
        }
        break

      case "ITEM":
        if (webhook_code === "ERROR") {
          console.error("Item error for:", item_id, error)
          // Update item status to error
          await supabase
            .from("plaid_items")
            .update({
              status: "error",
              error_message: error?.error_message || "Unknown error",
              updated_at: new Date().toISOString(),
            })
            .eq("item_id", item_id)
        } else if (webhook_code === "PENDING_EXPIRATION") {
          console.log("Item pending expiration:", item_id)
          await supabase
            .from("plaid_items")
            .update({
              status: "pending_expiration",
              updated_at: new Date().toISOString(),
            })
            .eq("item_id", item_id)
        }
        break

      default:
        console.log("Unhandled webhook type:", webhook_type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      {
        error: error.message || "Webhook processing failed",
      },
      { status: 500 },
    )
  }
}
