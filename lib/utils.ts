import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { addDays, addWeeks, addMonths, addYears } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function getNextBillingDate(currentDate: Date, billingCycle: string): Date {
  switch (billingCycle.toLowerCase()) {
    case "daily":
      return addDays(currentDate, 1)
    case "weekly":
      return addWeeks(currentDate, 1)
    case "monthly":
      return addMonths(currentDate, 1)
    case "quarterly":
      return addMonths(currentDate, 3)
    case "yearly":
      return addYears(currentDate, 1)
    default:
      return addMonths(currentDate, 1) // Default to monthly
  }
}

export function calculateAnnualCost(amount: number, billingCycle: string): number {
  switch (billingCycle.toLowerCase()) {
    case "daily":
      return amount * 365
    case "weekly":
      return amount * 52
    case "monthly":
      return amount * 12
    case "quarterly":
      return amount * 4
    case "yearly":
      return amount
    default:
      return amount * 12 // Default to monthly
  }
}

export function getDaysUntilNextBilling(nextBillingDate: Date): number {
  const today = new Date()
  const diffTime = nextBillingDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getBillingCycleLabel(cycle: string): string {
  const labels: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  }
  return labels[cycle.toLowerCase()] || "Monthly"
}
