import { createClient } from "@/lib/supabase/route-client"
import { NextResponse } from "next/server"

const merchantGuides: Record<string, { url?: string; steps: string[] }> = {
  netflix: {
    url: "https://www.netflix.com/cancelplan",
    steps: ["Open Netflix account settings.", "Choose Cancel Membership.", "Confirm cancellation before the next billing date."],
  },
  spotify: {
    url: "https://www.spotify.com/account/subscription/",
    steps: ["Open your Spotify account page.", "Select Manage your plan.", "Choose Change or cancel, then follow the prompts."],
  },
  adobe: {
    url: "https://account.adobe.com/plans",
    steps: ["Open Adobe plans.", "Select Manage plan.", "Choose Cancel your plan and confirm the reason."],
  },
  dropbox: {
    url: "https://www.dropbox.com/account/plan",
    steps: ["Open Dropbox plan settings.", "Choose Cancel plan.", "Confirm downgrade or cancellation."],
  },
  peacock: {
    url: "https://www.peacocktv.com/account/plans",
    steps: ["Open Peacock plans and payment.", "Choose Change or cancel plan.", "Confirm cancellation."],
  },
}

function getGuide(subscriptionName: string, cancellationUrl?: string | null) {
  const match = Object.entries(merchantGuides).find(([keyword]) => subscriptionName.toLowerCase().includes(keyword))

  if (match) {
    return {
      cancellation_url: cancellationUrl || match[1].url || null,
      instructions: match[1].steps,
    }
  }

  return {
    cancellation_url: cancellationUrl || null,
    instructions: [
      `Open ${subscriptionName}'s account or billing settings.`,
      "Look for plan, membership, billing, or subscription settings.",
      "Choose cancel, downgrade, or turn off auto-renewal, then save the confirmation.",
    ],
  }
}

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

    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id, name, website_url, status")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single()

    const subscription = subscriptionData as { id: string; name: string; website_url: string | null; status: string } | null

    if (subscriptionError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    const guide = getGuide(subscription.name, subscription.website_url)

    const { data: existingRequest } = await supabase
      .from("cancellation_requests")
      .select("*")
      .eq("subscription_id", subscription.id)
      .eq("user_id", user.id)
      .in("status", ["requested", "in_progress"])
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json({
        request: existingRequest,
        guide,
        message: "Cancellation request already exists.",
      })
    }

    const cancellationPayload = {
      user_id: user.id,
      subscription_id: subscription.id,
      subscription_name: subscription.name,
      status: "requested",
      cancellation_url: guide.cancellation_url,
      instructions: guide.instructions,
    }

    const { data: cancellationRequest, error: requestError } = await supabase
      .from("cancellation_requests")
      .insert(cancellationPayload as never)
      .select()
      .single()

    if (requestError) {
      return NextResponse.json({ error: requestError.message }, { status: 500 })
    }

    await supabase
      .from("subscriptions")
      .update({ status: "pending_cancellation" } as never)
      .eq("id", subscription.id)
      .eq("user_id", user.id)

    return NextResponse.json({
      request: cancellationRequest,
      guide,
      message: "Cancellation request created.",
    })
  } catch (error: any) {
    console.error("Error creating cancellation request:", error)
    return NextResponse.json({ error: error.message || "Failed to request cancellation" }, { status: 500 })
  }
}
