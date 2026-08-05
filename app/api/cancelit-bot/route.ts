import { NextResponse } from "next/server"

export const maxDuration = 20

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
const ANTHROPIC_VERSION = "2023-06-01"
const DEFAULT_MODEL = "claude-3-5-haiku-20241022"
const MAX_MESSAGE_LENGTH = 700

type ChatRole = "user" | "assistant"

type ChatMessage = {
  role: ChatRole
  content: string
}

const cancellationDirectory = [
  {
    name: "Netflix",
    keywords: ["netflix"],
    cancelUrl: "https://www.netflix.com/cancelplan",
    saveTip: "Review ad-supported or lower-screen plans before cancelling if you still use it often.",
  },
  {
    name: "Spotify",
    keywords: ["spotify"],
    cancelUrl: "https://www.spotify.com/account/subscription/",
    saveTip: "Check Duo, Family, or Student pricing if multiple people in the household use Spotify.",
  },
  {
    name: "Adobe",
    keywords: ["adobe", "creative cloud", "photoshop", "acrobat"],
    cancelUrl: "https://account.adobe.com/plans",
    saveTip: "Compare the single-app plan against the full Creative Cloud bundle before renewing.",
  },
  {
    name: "Dropbox",
    keywords: ["dropbox"],
    cancelUrl: "https://www.dropbox.com/account/plan",
    saveTip: "Check current storage use. If you are under the free limit, downgrade instead of paying monthly.",
  },
  {
    name: "Peacock",
    keywords: ["peacock"],
    cancelUrl: "https://www.peacocktv.com/account/plans",
    saveTip: "Cancel during months without shows or sports you actively watch.",
  },
  {
    name: "Hulu",
    keywords: ["hulu"],
    cancelUrl: "https://secure.hulu.com/account",
    saveTip: "Review bundle pricing with Disney+ and ESPN+ before paying for separate plans.",
  },
  {
    name: "Disney+",
    keywords: ["disney", "disney+"],
    cancelUrl: "https://www.disneyplus.com/account",
    saveTip: "Check whether an annual plan or bundle is cheaper than monthly billing.",
  },
  {
    name: "Max",
    keywords: ["max", "hbo"],
    cancelUrl: "https://www.max.com/subscription",
    saveTip: "If you subscribed through Apple, Google, Roku, or Amazon, cancel through that billing provider instead.",
  },
  {
    name: "Amazon Prime",
    keywords: ["amazon prime", "prime video", "amazon"],
    cancelUrl: "https://www.amazon.com/amazonprime",
    saveTip: "Check whether you use shipping, video, music, and reading enough to justify the full Prime cost.",
  },
  {
    name: "YouTube TV",
    keywords: ["youtube tv", "youtube premium", "youtube"],
    cancelUrl: "https://www.youtube.com/paid_memberships",
    saveTip: "Pause the membership during travel or off-season sports months if cancellation feels too permanent.",
  },
  {
    name: "Apple subscriptions",
    keywords: ["apple", "icloud", "apple tv", "apple music"],
    cancelUrl: "https://support.apple.com/billing",
    saveTip: "Open iPhone Settings, tap your name, then Subscriptions to review all Apple-billed services.",
  },
  {
    name: "Google subscriptions",
    keywords: ["google", "google one", "play store"],
    cancelUrl: "https://play.google.com/store/account/subscriptions",
    saveTip: "Check Google Play subscriptions and Google One storage before paying for duplicate cloud storage.",
  },
]

function sanitizeMessage(message: unknown) {
  if (typeof message !== "string") {
    return ""
  }

  return message.replace(/\s+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH)
}

function sanitizeHistory(history: unknown): ChatMessage[] {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .slice(-6)
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null
      }

      const candidate = entry as { role?: unknown; content?: unknown }
      const role = candidate.role === "assistant" ? "assistant" : candidate.role === "user" ? "user" : null
      const content = sanitizeMessage(candidate.content)

      if (!role || !content) {
        return null
      }

      return { role, content }
    })
    .filter((entry): entry is ChatMessage => Boolean(entry))
}

function findDirectoryMatch(message: string) {
  const normalized = message.toLowerCase()
  return cancellationDirectory.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))
}

function buildFallbackReply(message: string) {
  const match = findDirectoryMatch(message)

  if (match) {
    return [
      `For ${match.name}, start here: ${match.cancelUrl}`,
      `Money-saving check: ${match.saveTip}`,
      "If the subscription was purchased through Apple, Google, Roku, Amazon, or a phone carrier, cancel through that billing provider instead of the merchant website.",
    ].join("\n")
  }

  return [
    "Tell me the subscription name and I can point you to the most likely cancellation page or billing path.",
    "Quick ways to save: cancel duplicate streaming services, downgrade storage plans you barely use, switch monthly plans to annual only when you are sure you will keep them, and review trials before the renewal date.",
    "In CancelIt, connect Plaid or add subscriptions manually so the app can rank the highest-cost renewals first.",
  ].join("\n")
}

function buildSystemPrompt() {
  return [
    "You are CancelIt Bot, a concise customer support assistant for CancelIt.app.",
    "Your job is to help consumers save money on subscriptions and find where to cancel or downgrade services.",
    "Give practical steps, cancellation URLs, billing-provider warnings, and savings ideas.",
    "Never ask for bank credentials, passwords, one-time passcodes, full card numbers, Social Security numbers, or sensitive identity details.",
    "Do not claim CancelIt has cancelled anything unless the user says they completed it. Tell users to verify cancellation confirmation with the merchant.",
    "If a merchant may be billed through Apple, Google, Roku, Amazon, PayPal, a phone carrier, or a bank card, explain that they must cancel through the billing provider that charges them.",
    "Keep replies under 140 words unless the user asks for more detail.",
    `Known cancellation directory: ${JSON.stringify(cancellationDirectory)}`,
  ].join("\n")
}

function toAnthropicMessages(history: ChatMessage[], message: string) {
  return [
    ...history.map((entry) => ({ role: entry.role, content: entry.content })),
    { role: "user" as const, content: message },
  ]
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = sanitizeMessage(body?.message)
    const history = sanitizeHistory(body?.history)

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json({ reply: buildFallbackReply(message), source: "fallback" })
    }

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 420,
        temperature: 0.25,
        system: buildSystemPrompt(),
        messages: toAnthropicMessages(history, message),
      }),
    })

    if (!anthropicResponse.ok) {
      console.error("Claude bot error:", await anthropicResponse.text())
      return NextResponse.json({ reply: buildFallbackReply(message), source: "fallback" })
    }

    const data = await anthropicResponse.json()
    const reply = Array.isArray(data?.content)
      ? data.content
          .filter((part: { type?: string; text?: string }) => part.type === "text" && typeof part.text === "string")
          .map((part: { text: string }) => part.text.trim())
          .filter(Boolean)
          .join("\n")
      : ""

    return NextResponse.json({ reply: reply || buildFallbackReply(message), source: reply ? "claude" : "fallback" })
  } catch (error) {
    console.error("CancelIt bot error:", error)
    return NextResponse.json({ error: "CancelIt Bot is temporarily unavailable" }, { status: 500 })
  }
}
