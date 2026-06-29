import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

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

    const body = await request.json()
    const { public_token, institution, accounts } = body

    if (!public_token) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    const { error: dbError } = await supabase
      .from("plaid_items")
      .upsert(
        {
          user_id: user.id,
          item_id: itemId,
          access_token: accessToken,
          institution_id: institution?.institution_id,
          institution_name: institution?.name,
          status: "active",
          error_message: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "item_id" },
      )

    if (dbError) {
      console.error("Error storing Plaid connection:", dbError)
      throw new Error("Failed to store bank connection")
    }

    if (accounts && accounts.length > 0) {
      const accountData = accounts.map((account: any) => ({
        user_id: user.id,
        item_id: itemId,
        account_id: account.id,
        account_name: account.name,
        account_mask: account.mask,
        account_type: account.type,
        account_subtype: account.subtype,
        updated_at: new Date().toISOString(),
      }))

      const { error: accountsError } = await supabase
        .from("plaid_accounts")
        .upsert(accountData, { onConflict: "user_id,account_id" })

      if (accountsError) {
        console.error("Error storing Plaid accounts:", accountsError)
        throw new Error("Failed to store connected accounts")
      }
    }

    return NextResponse.json({
      success: true,
      item_id: itemId,
      institution: institution?.name,
    })
  } catch (error: any) {
    console.error("Error exchanging token:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to exchange token",
      },
      { status: 500 },
    )
  }
}
