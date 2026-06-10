import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

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

export async function POST(request: Request) {
  try {
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

    console.log("Exchanging public token for user:", user.id)

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    console.log("Token exchanged successfully, storing in database...")

    // Store the access token and item ID in the database
    const { error: dbError } = await supabase.from("plaid_items").insert({
      user_id: user.id,
      item_id: itemId,
      access_token: accessToken,
      institution_id: institution?.institution_id,
      institution_name: institution?.name,
      status: "active",
    })

    if (dbError) {
      console.error("Error storing Plaid connection:", dbError)
      throw new Error("Failed to store bank connection")
    }

    console.log("Plaid connection stored successfully")

    // Store account information
    if (accounts && accounts.length > 0) {
      const accountData = accounts.map((account: any) => ({
        user_id: user.id,
        item_id: itemId,
        account_id: account.id,
        account_name: account.name,
        account_mask: account.mask,
        account_type: account.type,
        account_subtype: account.subtype,
      }))

      await supabase.from("plaid_accounts").insert(accountData)
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
