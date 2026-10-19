import { createClient } from "@/lib/supabase/route-client"
import { getPlanLimits, normalizeTier } from "@/lib/plan-limits"
import { NextResponse } from "next/server"

export const maxDuration = 20

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const DEFAULT_ADVISOR_MODEL = "claude-3-5-haiku-20241022"
const XAI_CHAT_API_URL = "https://api.x.ai/v1/chat/completions"

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
const nonSubscriptionTerms = [
  "withdrawal",
  "transfer",
  "transfer_out",
  "cash withdrawal",
  "atm",
  "bank fee",
  "overdraft",
  "loan",
  "lending",
  "credit card payment",
  "tax payment",
]

function mentionedAmounts(text: string) {
  return (text.match(/\$?\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?/g) || [])
    .map((match) => Number(match.replace(/[^\d.]/g, "")))
    .filter((amount) => Number.isFinite(amount) && amount > 0)
}

function matchesMentionedAmount(subscriptionAmount: number, mentionedAmount: number) {
  // Bank descriptions and users often round or transpose a small fee. Treat a
  // close match as the same charge, but keep the tolerance deliberately small
  // so an essential-expense instruction cannot hide unrelated subscriptions.
  const tolerance = Math.max(1, Math.min(25, mentionedAmount * 0.01))
  return Math.abs(subscriptionAmount - mentionedAmount) <= tolerance
}

function isEssentialOrPayment(subscription: { name: string; category: string | null }) {
  const text = `${subscription.name} ${subscription.category || ""}`.toLowerCase().replace(/[_-]+/g, " ")
  return [...essentialExpenseTerms, ...nonSubscriptionTerms].some((term) => text.includes(term))
}

type AdvisorSubscription = {
  id: string
  name: string
  cost: number | null
  amount: number | null
  billing_cycle: string
  category: string | null
}

function advisorSnapshot(subscriptions: AdvisorSubscription[], protectedIds: Set<string>) {
  return subscriptions.map((subscription) => ({
    name: subscription.name,
    monthlyAmount: Number(monthlyCost(subscription).toFixed(2)),
    category: subscription.category || "Uncategorized",
    treatment: protectedIds.has(subscription.id) || isEssentialOrPayment(subscription) ? "protect / verify; do not recommend cancellation" : "possible optional service; verify before cancellation",
  }))
}

async function generateSavingsCoachReply({
  message,
  history,
  subscriptions,
  protectedIds,
}: {
  message: string
  history: Array<{ role: "user" | "assistant"; text: string }>
  subscriptions: AdvisorSubscription[]
  protectedIds: Set<string>
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const xaiApiKey = process.env.XAI_API_KEY
  if (!apiKey && !xaiApiKey) return null

  const recentMessages = history
    .slice(-6)
    .filter((entry) => entry && (entry.role === "user" || entry.role === "assistant") && typeof entry.text === "string")
    .map((entry) => ({ role: entry.role, content: entry.text.slice(0, 700) }))

  const system = [
    "You are CancelIt Savings Coach. Help a user understand recurring spending and safely find realistic ways to save money.",
    "You are not a licensed financial adviser. Do not give investment, tax, legal, credit-repair, or debt-restructuring advice.",
    "Treat rent, mortgages, utilities, insurance, loans, transfers, withdrawals, bank fees, and unrecognized transactions as protected or verify-first. Never suggest cancelling them merely because they are expensive.",
    "Recommend action only for a recognizable, optional recurring service after explaining why it may be worth reviewing. Never claim a charge is definitely a subscription when the merchant is unclear.",
    "Be practical and personalized: say what to keep protected, identify one to three safe opportunities, and give one next action for each. For an unknown charge, tell the user to verify it with their statement or bank before doing anything.",
    "Use headings: What I see, Best next steps, and Potential savings. Keep the reply below 180 words. Do not request credentials, card numbers, account numbers, passwords, or codes.",
    `User's recurring-spend snapshot: ${JSON.stringify(advisorSnapshot(subscriptions, protectedIds))}`,
  ].join("\n")

  const messages = recentMessages.at(-1)?.role === "user" && recentMessages.at(-1)?.content === message
    ? recentMessages
    : [...recentMessages, { role: "user" as const, content: message.slice(0, 700) }]

  if (!apiKey && xaiApiKey) {
    try {
      const response = await fetch(XAI_CHAT_API_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${xaiApiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.XAI_MODEL || "latest",
          max_tokens: 420,
          temperature: 0.2,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      })

      if (!response.ok) {
        console.error("Savings coach xAI error:", response.status)
        return null
      }

      const data = await response.json()
      const reply = data?.choices?.[0]?.message?.content
      return typeof reply === "string" && reply.trim() ? reply.trim() : null
    } catch (error) {
      console.error("Savings coach xAI request failed:", error)
      return null
    }
  }

  try {

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_ADVISOR_MODEL,
        max_tokens: 420,
        temperature: 0.2,
        system,
        messages,
      }),
    })

    if (!response.ok) {
      console.error("Savings coach model error:", response.status)
      return null
    }

    const data = await response.json()
    const reply = Array.isArray(data?.content)
      ? data.content
          .filter((part: { type?: string; text?: string }) => part.type === "text" && typeof part.text === "string")
          .map((part: { text: string }) => part.text.trim())
          .filter(Boolean)
          .join("\n")
      : ""

    return reply || null
  } catch (error) {
    console.error("Savings coach model request failed:", error)
    return null
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
              const amountWasNamed = amounts.some((amount) => matchesMentionedAmount(monthlyCost(subscription), amount))
              return nameIsEssential || amountWasNamed
            })
            .map((subscription) => subscription.id)
        : [],
    )
    const safetyExcludedIds = new Set(
      activeSubscriptions.filter(isEssentialOrPayment).map((subscription) => subscription.id),
    )
    const reviewCandidates = sortedByCost.filter(
      (subscription) => !protectedSubscriptionIds.has(subscription.id) && !safetyExcludedIds.has(subscription.id),
    )
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
      const otherPayments = sortedByCost
        .filter((subscription) => safetyExcludedIds.has(subscription.id) && !protectedSubscriptionIds.has(subscription.id))
        .slice(0, 3)
        .map((subscription) => subscription.name)

      return NextResponse.json({
        reply: [
          `You are right — ${protectedNames.join(" and ")} is an essential expense, not a cancellation target. I will keep it in your spending total but will not suggest cancelling it.`,
          "Practical next step: keep rent protected, then look only for optional services you can verify on your statement. Do not cancel a transfer, withdrawal, loan payment, or bill just because it is large.",
          nextReviews.length
            ? `Only investigate these as possible optional subscriptions after you recognize the merchant:\n${nextReviews.map((subscription, index) => `${index + 1}. ${subscription.name}: about $${monthlyCost(subscription).toFixed(2)}/mo — confirm what it is before cancelling.`).join("\n")}`
            : "I do not see a clearly optional subscription to recommend yet.",
          otherPayments.length
            ? `I will also avoid suggesting you cancel these payment-like entries until you verify them: ${otherPayments.join(", ")}.`
            : "",
          "If you do not recognize a charge, investigate it with your bank or card issuer first; do not use a cancellation action for an unrecognized transaction.",
        ].join("\n\n"),
      })
    }

    const coachReply = await generateSavingsCoachReply({
      message,
      history: Array.isArray(history)
        ? history
            .filter((entry) => entry?.role === "user" || entry?.role === "assistant")
            .map((entry) => ({ role: entry.role === "assistant" ? "assistant" as const : "user" as const, text: typeof entry?.text === "string" ? entry.text : "" }))
            .filter((entry) => entry.text)
        : [],
      subscriptions: activeSubscriptions,
      protectedIds: new Set([...protectedSubscriptionIds, ...safetyExcludedIds]),
    })

    if (coachReply) {
      return NextResponse.json({ reply: coachReply })
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
          ? "I do not see a clearly optional subscription yet. Your largest entries appear to be essential expenses or payment activity, so I will not recommend cancelling them. Verify any unfamiliar merchant with your statement or bank first, then tell me the service name and I can give you a safe cancellation path."
          : "I do not see active subscriptions yet. Add subscriptions manually or connect Plaid, then I can rank what to review first.",
      })
    }

    const topThree = reviewCandidates.slice(0, 3)
    const savings = topThree.reduce((total, subscription) => total + monthlyCost(subscription), 0)

    return NextResponse.json({
      reply: [
        "Here is a practical review plan — these are possible optional subscriptions, not essential bills or payment activity:",
        ...topThree.map((subscription, index) => `${index + 1}. ${subscription.name}: about $${monthlyCost(subscription).toFixed(2)}/mo. First confirm the merchant and whether you still use it.`),
        `If all three are optional and you stop them, the potential savings is about $${savings.toFixed(2)}/mo or $${(savings * 12).toFixed(2)}/yr.`,
        "Do not cancel an item you do not recognize; check the bank statement or contact your bank first. Once you confirm an optional service, I can give you its cancellation steps.",
      ].join("\n"),
    })
  } catch (error: any) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: error.message || "Assistant failed" }, { status: 500 })
  }
}
