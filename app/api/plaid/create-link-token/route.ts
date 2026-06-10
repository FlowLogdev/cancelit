import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid"

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

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Creating Plaid link token for user:", user.id)

    // Create a link token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: "CancelIt",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: process.env.PLAID_WEBHOOK_URL,
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    })

    console.log("Link token created successfully")

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    })
  } catch (error: any) {
    console.error("Error creating link token:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to create link token",
      },
      { status: 500 },
    )
  }
}
