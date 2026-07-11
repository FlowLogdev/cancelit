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

type ExistingPlaidInstitution = {
  item_id: string
  institution_name: string | null
  status: string | null
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

    // The generated Supabase types in this repo are stale and mark Plaid tables as never.
    // Keep the cast local to this route until the database types are regenerated.
    const plaidDb = supabase as any

    const body = await request.json()
    const { public_token, institution, accounts } = body

    if (!public_token) {
      return NextResponse.json({ error: "Public token is required" }, { status: 400 })
    }

    if (institution?.institution_id) {
      const { data: existingInstitutionData, error: existingInstitutionError } = await plaidDb
        .from("plaid_items")
        .select("item_id,institution_name,status")
        .eq("user_id", user.id)
        .eq("institution_id", institution.institution_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingInstitutionError) {
        console.error("Error checking existing Plaid institution:", existingInstitutionError)
        throw new Error("Failed to check existing bank connections")
      }

      const existingInstitution = existingInstitutionData as ExistingPlaidInstitution | null

      if (existingInstitution) {
        return NextResponse.json(
          {
            error: `${existingInstitution.institution_name || institution.name || "This bank"} is already connected. Use the existing connection instead of adding the same bank again.`,
            code: "DUPLICATE_INSTITUTION",
            item_id: existingInstitution.item_id,
          },
          { status: 409 },
        )
      }
    }

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    const { error: dbError } = await plaidDb
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

      const { error: accountsError } = await plaidDb
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
