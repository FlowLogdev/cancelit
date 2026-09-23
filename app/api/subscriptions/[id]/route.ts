import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { data, error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle()

    if (error) {
      console.error("Error removing subscription:", error)
      return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("Unexpected subscription removal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
