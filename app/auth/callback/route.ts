import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(`${origin}/signin?error=auth_callback_error`)
    }

    if (data.user) {
      console.log("User authenticated:", data.user.email)

      // Check if customer record exists
      const { data: existingCustomer, error: customerCheckError } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", data.user.id)
        .single()

      if (customerCheckError && customerCheckError.code !== "PGRST116") {
        console.error("Error checking customer record:", customerCheckError)
      }

      // Create customer record if it doesn't exist
      if (!existingCustomer) {
        console.log("Creating customer record for user:", data.user.id)
        const { error: customerError } = await supabase.from("customers").insert({
          user_id: data.user.id,
          email: data.user.email || "",
          full_name: data.user.user_metadata?.full_name || null,
          subscription_status: "free",
        })

        if (customerError) {
          console.error("Error creating customer record:", customerError)
          // Don't fail the auth flow if customer creation fails
        } else {
          console.log("Customer record created successfully")
        }
      } else {
        console.log("Customer record already exists")
      }
    }
  }

  // Redirect to pricing page after successful authentication
  return NextResponse.redirect(`${origin}/pricing`)
}

export const dynamic = "force-dynamic"
