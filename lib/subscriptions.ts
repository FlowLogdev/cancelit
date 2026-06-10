import { createClient } from "./supabase/client"
import type { Subscription, SubscriptionInsert, SubscriptionUpdate } from "./types"

const supabase = createClient()

export async function getSubscriptions(userId: string): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function addSubscription(subscription: SubscriptionInsert): Promise<Subscription> {
  const { data, error } = await supabase.from("subscriptions").insert(subscription).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateSubscription(id: string, updates: SubscriptionUpdate): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export function calculateMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.status !== "active") return total

    switch (sub.billing_cycle) {
      case "monthly":
        return total + sub.amount
      case "yearly":
        return total + sub.amount / 12
      case "weekly":
        return total + sub.amount * 4.33
      default:
        return total
    }
  }, 0)
}

export function calculateYearlyTotal(subscriptions: Subscription[]): number {
  return calculateMonthlyTotal(subscriptions) * 12
}
