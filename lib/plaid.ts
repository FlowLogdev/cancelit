import { Configuration, PlaidApi, PlaidEnvironments } from "plaid"

// Get environment from server-side environment variable
const getPlaidEnvironment = () => {
  const env = process.env.PLAID_ENV || "sandbox"

  switch (env) {
    case "production":
      return PlaidEnvironments.production
    case "development":
      return PlaidEnvironments.development
    case "sandbox":
    default:
      return PlaidEnvironments.sandbox
  }
}

const configuration = new Configuration({
  basePath: getPlaidEnvironment(),
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
      "PLAID-SECRET": process.env.PLAID_SECRET!,
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

// Helper function to get Plaid environment name
export const getPlaidEnvName = () => {
  return process.env.PLAID_ENV || "sandbox"
}

// Common subscription merchants for better detection
export const SUBSCRIPTION_MERCHANTS = [
  "netflix",
  "spotify",
  "apple",
  "amazon",
  "microsoft",
  "google",
  "adobe",
  "dropbox",
  "zoom",
  "slack",
  "github",
  "figma",
  "canva",
  "notion",
  "discord",
  "youtube",
  "hulu",
  "disney",
  "hbo",
  "paramount",
  "peacock",
  "crunchyroll",
  "twitch",
]

// Helper to detect if a transaction might be a subscription
export const isLikelySubscription = (description: string, amount: number) => {
  const lowerDesc = description.toLowerCase()

  // Check for subscription keywords
  const subscriptionKeywords = ["subscription", "monthly", "annual", "recurring", "premium", "pro", "plus"]
  const hasSubscriptionKeyword = subscriptionKeywords.some((keyword) => lowerDesc.includes(keyword))

  // Check for known subscription merchants
  const hasKnownMerchant = SUBSCRIPTION_MERCHANTS.some((merchant) => lowerDesc.includes(merchant))

  // Check for round amounts (common in subscriptions)
  const isRoundAmount = amount % 1 === 0 || (amount * 100) % 25 === 0

  return hasSubscriptionKeyword || hasKnownMerchant || (isRoundAmount && amount > 0.99 && amount < 1000)
}

// Helper function to create a link token
export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: "CancelIt App",
      products: ["transactions"],
      country_codes: ["US"],
      language: "en",
    })

    return response.data
  } catch (error) {
    console.error("Error creating link token:", error)
    throw error
  }
}

// Exchange public token for access token
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })

    return response.data
  } catch (error) {
    console.error("Error exchanging public token:", error)
    throw error
  }
}

// Get transactions for a specific access token
export async function getTransactions(accessToken: string, startDate: string, endDate: string) {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    })

    return response.data
  } catch (error) {
    console.error("Error getting transactions:", error)
    throw error
  }
}

// Detect recurring transactions that might be subscriptions
export function detectSubscriptions(transactions: any[]) {
  // Group transactions by account and description
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const key = `${transaction.account_id}-${transaction.name}`
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(transaction)
    return acc
  }, {})

  // Find potential subscriptions (transactions with similar amounts that occur regularly)
  const potentialSubscriptions = []

  for (const key in groupedTransactions) {
    const group = groupedTransactions[key]

    // Only consider groups with at least 2 transactions
    if (group.length >= 2) {
      // Sort by date
      group.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Check if amounts are similar
      const amounts = group.map((t) => t.amount)
      const averageAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
      const amountVariation = Math.max(...amounts.map((amount) => Math.abs(amount - averageAmount) / averageAmount))

      // If amount variation is less than 10%
      if (amountVariation < 0.1) {
        // Get the most recent transaction
        const mostRecent = group[group.length - 1]

        potentialSubscriptions.push({
          name: mostRecent.name,
          amount: mostRecent.amount,
          date: mostRecent.date,
          frequency: estimateFrequency(group),
          merchant_name: mostRecent.merchant_name || mostRecent.name,
          transaction_count: group.length,
        })
      }
    }
  }

  return potentialSubscriptions
}

// Estimate subscription frequency based on transaction dates
function estimateFrequency(transactions: any[]) {
  if (transactions.length < 2) return "unknown"

  // Calculate days between transactions
  const intervals = []
  for (let i = 1; i < transactions.length; i++) {
    const daysDiff = Math.round(
      (new Date(transactions[i].date).getTime() - new Date(transactions[i - 1].date).getTime()) / (1000 * 60 * 60 * 24),
    )
    intervals.push(daysDiff)
  }

  // Calculate average interval
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length

  // Determine frequency based on average interval
  if (avgInterval <= 7) return "weekly"
  if (avgInterval <= 15) return "bi-weekly"
  if (avgInterval >= 25 && avgInterval <= 35) return "monthly"
  if (avgInterval >= 85 && avgInterval <= 95) return "quarterly"
  if (avgInterval >= 350 && avgInterval <= 380) return "yearly"

  return "unknown"
}
