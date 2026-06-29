import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}))
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.info("Plaid Link event", {
      user_id: user?.id || "anonymous",
      event_name: payload.eventName,
      link_session_id: payload.metadata?.link_session_id,
      request_id: payload.metadata?.request_id,
      institution_id: payload.metadata?.institution_id || payload.metadata?.institution?.institution_id,
      institution_name: payload.metadata?.institution_name || payload.metadata?.institution?.name,
      error_code: payload.error?.error_code,
      error_type: payload.error?.error_type,
      error_message: payload.error?.error_message,
      display_message: payload.error?.display_message,
      exit_status: payload.metadata?.status,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to log Plaid Link event", error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
