import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid"

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

function getRedirectUri(request: Request) {
  const origin = request.headers.get("origin")
  const fallback = process.env.PLAID_REDIRECT_URI
  const allowedOrigins = new Set([
    "https://cancelit.app",
    "https://www.cancelit.app",
    "http://localhost:3000",
    "http://localhost:3005",
  ])

  if (origin && allowedOrigins.has(origin)) {
    return `${origin}/plaid/oauth`
  }

  return fallback
}

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

    const redirectUri = getRedirectUri(request)

    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: user.id,
      },
      client_name: "CancelIt",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      transactions: {
        days_requested: 180,
      },
      webhook: process.env.PLAID_WEBHOOK_URL,
      ...(redirectUri ? { redirect_uri: redirectUri } : {}),
    })

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    })
  } catch (error: any) {
    const plaidError = error?.response?.data
    console.error("Error creating link token:", plaidError || error)

    const errorCode = plaidError?.error_code
    const errorMessage = plaidError?.display_message || plaidError?.error_message || error.message

    return NextResponse.json(
      {
        error: errorMessage || "Failed to create link token",
        code: errorCode,
      },
      { status: 500 },
    )
  }
}
