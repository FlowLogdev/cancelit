export type PlanTier = "free" | "minimum" | "medium" | "maximum"

export const PLAN_LIMITS: Record<
  PlanTier,
  { trackedSubscriptions: number; plaidImportLimit: number; plaidAccountLimit: number; aiAssistant: boolean }
> = {
  free: {
    trackedSubscriptions: 5,
    plaidImportLimit: 5,
    plaidAccountLimit: 5,
    aiAssistant: false,
  },
  minimum: {
    trackedSubscriptions: 10,
    plaidImportLimit: 10,
    plaidAccountLimit: 10,
    aiAssistant: false,
  },
  medium: {
    trackedSubscriptions: 50,
    plaidImportLimit: 50,
    plaidAccountLimit: 50,
    aiAssistant: true,
  },
  maximum: {
    trackedSubscriptions: Number.POSITIVE_INFINITY,
    plaidImportLimit: Number.POSITIVE_INFINITY,
    plaidAccountLimit: Number.POSITIVE_INFINITY,
    aiAssistant: true,
  },
}

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === "support@flowlog.dev"
}

export function normalizeTier(tier?: string | null): PlanTier {
  const normalized = tier?.toLowerCase()

  if (normalized === "minimum" || normalized === "medium" || normalized === "maximum") {
    return normalized
  }

  return "free"
}

export function getPlanLimits(tier?: string | null, email?: string | null) {
  if (isAdminEmail(email)) {
    return PLAN_LIMITS.maximum
  }

  return PLAN_LIMITS[normalizeTier(tier)]
}

export function formatLimit(limit: number) {
  return Number.isFinite(limit) ? String(limit) : "unlimited"
}
