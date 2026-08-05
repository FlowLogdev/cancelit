export type StripePlanTier = "minimum" | "medium" | "maximum"

export type StripePlanConfig = {
  tier: StripePlanTier
  name: string
  priceId: string
  unitAmount: number
}

const planPriceEnvKeys: Record<StripePlanTier, string[]> = {
  minimum: ["STRIPE_PRICE_MINIMUM", "NEXT_PUBLIC_STRIPE_PRICE_MINIMUM"],
  medium: ["STRIPE_PRICE_MEDIUM", "NEXT_PUBLIC_STRIPE_PRICE_MEDIUM"],
  maximum: ["STRIPE_PRICE_MAXIMUM", "NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM"],
}

const planPriceDefaults: Record<StripePlanTier, string> = {
  minimum: "price_1TmQ5hHnnXzltziloT7UhPtI",
  medium: "price_1U0wS3HnnXzltzil4IdgOm8X",
  maximum: "price_1TmQ6ZHnnXzltzileGjyuSoj",
}

const planNames: Record<StripePlanTier, string> = {
  minimum: "Starter",
  medium: "Plus",
  maximum: "Unlimited",
}

const planUnitAmounts: Record<StripePlanTier, number> = {
  minimum: 499,
  medium: 1299,
  maximum: 1999,
}

export function readEnvValue(key: string) {
  const rawValue = process.env[key]

  if (!rawValue) {
    return ""
  }

  let value = rawValue.trim()

  if (value.startsWith(`${key}=`)) {
    value = value.slice(key.length + 1).trim()
  }

  return value.replace(/^[\'"]|[\'"]$/g, "").trim()
}

export function getStripeSecretKey() {
  return readEnvValue("STRIPE_SECRET_KEY") || readEnvValue("STRIPE_SECRET_key")
}

export function getSiteUrl() {
  return readEnvValue("NEXT_PUBLIC_SITE_URL") || "https://cancelit.app"
}

export function isValidStripeSecretKey(secretKey: string) {
  return secretKey.startsWith("sk_")
}

export function isStripePlanTier(value: unknown): value is StripePlanTier {
  return value === "minimum" || value === "medium" || value === "maximum"
}

export function getStripePriceId(tier: StripePlanTier) {
  for (const key of planPriceEnvKeys[tier]) {
    const value = readEnvValue(key)

    if (value.startsWith("price_")) {
      return value
    }
  }

  return planPriceDefaults[tier]
}

export function getConfiguredStripePlans(): StripePlanConfig[] {
  return (Object.keys(planNames) as StripePlanTier[]).map((tier) => ({
    tier,
    name: planNames[tier],
    priceId: getStripePriceId(tier),
    unitAmount: planUnitAmounts[tier],
  }))
}

export function getConfiguredStripePlan(tier: StripePlanTier) {
  return getConfiguredStripePlans().find((plan) => plan.tier === tier)
}

export function getConfiguredStripePlanByPriceId(priceId: unknown) {
  if (typeof priceId !== "string" || !priceId.trim()) {
    return undefined
  }

  return getConfiguredStripePlans().find((plan) => plan.priceId === priceId.trim())
}
