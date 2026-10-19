import { createClient } from "@/lib/supabase/route-client"
import { getPlanLimits, normalizeTier } from "@/lib/plan-limits"
import { NextResponse } from "next/server"

const knownCancellationSteps: Record<string, string[]> = {
  netflix: ["Go to netflix.com/cancelplan.", "Sign in if asked.", "Choose Finish Cancellation and save the confirmation."],
  spotify: ["Go to spotify.com/account/subscription.", "Open Manage your plan.", "Choose Change or cancel and confirm."],
  adobe: ["Go to account.adobe.com/plans.", "Choose Manage plan.", "Select Cancel your plan and follow Adobe's confirmation screens."],
  dropbox: ["Go to dropbox.com/account/plan.", "Open Plan settings.", "Choose Cancel plan or downgrade."],
  peacock: ["Go to peacocktv.com/account/plans.", "Open Plans and payment.", "Choose Change or cancel plan."],
}

function monthlyCost(subscription: { cost: number | null; amount: number | null; billing_cycle: string }) {
  const value = Number(subscription.cost ?? subscription.amount ?? 0)
  if (subscription.billing_cycle === "yearly") return value / 12
  if (subscription.billing_cycle === "weekly") return (value * 52) / 12
  return value
}

function findMerchantGuide(message: string) {
  const normalized = message.toLowerCase()
  const match = Object.entries(knownCancellationSteps).find(([merchant]) => normalized.includes(merchant))
  return match ? { merchant: match[0], steps: match[1] } : null
}

const essentialExpenseTerms = ["rent", "mortgage", "utility", "utilities", "electric", "water", "gas bill", "insurance", "childcare", "tuition", "loan payment"]

function mentionedAmounts(text: string) {
  return (text.match(/\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g) || [])
    .map((match) => Number(match.replace(/[^\d.]/g, "")))
    .filter((amount) => Number.isFinite(amount) && amount > 0)
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

    const { message, history } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .maybeSingle()

    const customer = customerData as { subscription_tier: string | null } | null
    const tier = normalizeTier(customer?.subscription_tier)
    const limits = getPlanLimits(tier, user.email)

    if (!limits.aiAssistant) {
      return NextResponse.json({ error: "The savings assistant is available on Plus and Unlimited plans." }, { status: 402 })
    }

    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id, name, cost, amount, billing_cycle, next_billing_date, status, category")
      .eq("user_id", user.id)
      .order("next_billing_date", { ascending: true })

    if (subscriptionError) {
      return NextResponse.json({ error: subscriptionError.message }, { status: 500 })
    }

    const subscriptions = (subscriptionData || []) as Array<{
      id: string
      name: string
      cost: number | null
      amount: number | null
      billing_cycle: string
      next_billing_date: string
      status: string
      category: string | null
    }>

    const activeSubscriptions = subscriptions.filter((subscription) =>
      ["active", "pending_cancellation"].includes(subscription.status),
    )
    const totalMonthly = activeSubscriptions.reduce((total, subscription) => total + monthlyCost(subscription), 0)
    const sortedByCost = [...activeSubscriptions].sort((a, b) => monthlyCost(b) - monthlyCost(a))
    const recentConversation = Array.isArray(history)
      ? history
          .slice(-8)
          .filter((entry) => entry?.role === "user")
          .map((entry) => (typeof entry?.text === "string" ? entry.text : ""))
          .filter(Boolean)
      : []
    const conversationText = [...recentConversation, message].join(" ").toLowerCase()
    const essentialContext = essentialExpenseTerms.some((term) => conversationText.includes(term))
    const amounts = mentionedAmounts(conversationText)
    const protectedSubscriptionIds = new Set(
      essentialContext
        ? activeSubscriptions
            .filter((subscription) => {
              const nameIsEssential = essentialExpenseTerms.some((term) => subscription.name.toLowerCase().includes(term))
              const amountWasNamed = amounts.some((amount) => Math.abs(monthlyCost(subscription) - amount) < 0.01)
              return nameIsEssential || amountWasNamed
            })
            .map((subscription) => subscription.id)
        : [],
    )
    const reviewCandidates = sortedByCost.filter((subscription) => !protectedSubscriptionIds.has(subscription.id))
    const categoryTotals = activeSubscriptions.reduce<Record<string, number>>((totals, subscription) => {
      const category = subscription.category || "Other"
      totals[category] = (totals[category] || 0) + monthlyCost(subscription)
      return totals
    }, {})
    const topCategory = Object.entries(categoryTotals).sort(([, left], [, right]) => right - left)[0]
    const upcoming = [...activeSubscriptions]
      .filter((subscription) => subscription.next_billing_date)
      .slice(0, 3)
      .map((subscription) => `${subscription.name} on ${new Date(subscription.next_billing_date).toLocaleDateString()}`)

    const guide = findMerchantGuide(message)
    const normalizedMessage = message.toLowerCase()

    const isProtectingAnExpense =
      essentialContext &&
      /(cannot|can't|cant|do not|don't|dont|not)\s+(?:cancel|remove)|is my (?:rent|mortgage)|keep/.test(normalizedMessage)

    if (isProtectingAnExpense && protectedSubscriptionIds.size > 0) {
      const protectedNames = sortedByCost
        .filter((subscription) => protectedSubscriptionIds.has(subscription.id))
        .map((subscription) => `${subscription.name} ($${monthlyCost(subscription).toFixed(2)}/mo)`)
      const nextReviews = reviewCandidates.slice(0, 3)

      return NextResponse.json({
        reply: [
          `Got it — I’ll treat ${protectedNames.join(" and ")} as an essential expense and will not recommend cancelling it in this chat. It stays included in your spending total.`,
          nextReviews.length
            ? `The next items worth reviewing are:\n${nextReviews.map((subscription, index) => `${index + 1}. ${subscription.name}: about $${monthlyCost(subscription).toFixed(2)}/mo`).join("\n")}`
            : "I do not see another subscription to recommend reviewing yet.",
          "If an item is a real subscription you no longer use, I can help you find its cancellation steps. Do not remove a bank connection just to hide an essential bill.",
        ].join("\n\n"),
      })
    }

    if (guide) {
      return NextResponse.json({
        reply: [
          `Here is the fastest cancellation path I know for ${guide.merchant}:`,
          ...guide.steps.map((step, index) => `${index + 1}. ${step}`),
          "After you finish, mark the subscription as cancelled in CancelIt so your spending total stays clean.",
        ].join("\n"),
      })
    }

    if (normalizedMessage.includes("spending") || normalizedMessage.includes("monthly") || normalizedMessage.includes("total")) {
      return NextResponse.json({
        reply: `You are tracking ${activeSubscriptions.length} active subscriptions at about $${totalMonthly.toFixed(
          2,
        )} per month, or $${(totalMonthly * 12).toFixed(2)} per year. Your ${tier} plan can track ${
          Number.isFinite(limits.trackedSubscriptions) ? limits.trackedSubscriptions : "unlimited"
        } subscriptions.${topCategory ? ` Your largest category is ${topCategory[0]} at about $${topCategory[1].toFixed(2)}/mo.` : ""}`,
      })
    }

    if (normalizedMessage.includes("save") || normalizedMessage.includes("tip") || normalizedMessage.includes("reduce")) {
      const top = reviewCandidates[0]
      const categoryTip = topCategory
        ? `${topCategory[0]} is your biggest category at $${topCategory[1].toFixed(2)}/mo; compare overlapping services there first.`
        : ""
      return NextResponse.json({
        reply: [
          top ? `Start with ${top.name}: it costs about $${monthlyCost(top).toFixed(2)}/mo.` : "Start by reviewing your least-used subscription.",
          categoryTip,
          "Use CancelIt to remove anything you do not want to track, then request a cancellation guide for services you no longer use.",
          `Saving just one $${top ? monthlyCost(top).toFixed(2) : "10.00"}/mo service keeps about $${top ? (monthlyCost(top) * 12).toFixed(2) : "120.00"} per year in your budget.`,
        ].filter(Boolean).join("\n\n"),
      })
    }

    if (normalizedMessage.includes("renew") || normalizedMessage.includes("soon")) {
      return NextResponse.json({
        reply: upcoming.length
          ? `These renew soon:\n${upcoming.map((item) => `- ${item}`).join("\n")}\n\nReview these first because a cancellation request is most useful before the next billing date.`
          : "I do not see upcoming renewal dates yet. Add next billing dates or import from Plaid so I can prioritize them.",
      })
    }

    if (reviewCandidates.length === 0) {
      return NextResponse.json({
        reply: activeSubscriptions.length
          ? "I only see expenses you marked as essential. Add another subscription or tell me which service you are considering, and I can help without recommending essential bills."
          : "I do not see active subscriptions yet. Add subscriptions manually or connect Plaid, then I can rank what to review first.",
      })
    }

    const topThree = reviewCandidates.slice(0, 3)
    const savings = topThree.reduce((total, subscription) => total + monthlyCost(subscription), 0)

    return NextResponse.json({
      reply: [
        "Start with the highest monthly impact:",
        ...topThree.map((subscription, index) => `${index + 1}. ${subscription.name}: about $${monthlyCost(subscription).toFixed(2)}/mo`),
        `If you cancel those, the possible savings is about $${savings.toFixed(2)}/mo or $${(savings * 12).toFixed(2)}/yr.`,
        "Use the Request cancellation button beside each subscription when you want a tracked task and step-by-step instructions.",
      ].join("\n"),
    })
  } catch (error: any) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: error.message || "Assistant failed" }, { status: 500 })
  }
}
