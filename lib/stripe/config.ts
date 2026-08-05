export type StripePlanTier = "minimum" | "medium" | "maximum"

export type StripePlanConfig = {
  tier: StripePlanTier
  name: string
  priceId: string
}

const planPriceEnvKeys: Record<StripePlanTier, string[]> = {
  minimum: ["STRIPE_PRICE_MINIMUM", "NEXT_PUBLIC_STRIPE_PRICE_MINIMUM"],
  medium: ["STRIPE_PRICE_MEDIUM", "NEXT_PUBLIC_STRIPE_PRICE_MEDIUM"],
  maximum: ["STRIPE_PRICE_MAXIMUM", "NEXT_PUBLIC_STRIPE_PRICE_MAXIMUM"],
}

const planNames: Record<StripePlanTier, string> = {
  minimum: "Starter",
  medium: "Plus",
  maximum: "Unlimited",
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

  return value.replace(/^['"]|['"]$/g, "").trim()
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

    if (value) {
      return value
    }
  }

  return ""
}

export function getConfiguredStripePlans(): StripePlanConfig[] {
  return (Object.keys(planNames) as StripePlanTier[]).map((tier) => ({
    tier,
    name: planNames[tier],
    priceId: getStripePriceId(tier),
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
