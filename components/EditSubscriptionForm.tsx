"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateSubscription } from "@/lib/subscriptions"
import type { Subscription } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EditSubscriptionFormProps {
  subscription: Subscription
  onSuccess: () => void
}

export function EditSubscriptionForm({ subscription, onSuccess }: EditSubscriptionFormProps) {
  const [name, setName] = useState(subscription.name)
  const [amount, setAmount] = useState(subscription.amount.toString())
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(subscription.billing_cycle)
  const [category, setCategory] = useState(subscription.category)
  const [nextBillingDate, setNextBillingDate] = useState(
    new Date(subscription.next_billing_date).toISOString().split("T")[0],
  )
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateSubscription(subscription.id, {
        name,
        amount: Number.parseFloat(amount),
        billing_cycle: billingCycle,
        category,
        next_billing_date: nextBillingDate,
      })

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          placeholder="e.g., Netflix, Spotify"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-cycle">Billing Cycle</Label>
        <Select value={billingCycle} onValueChange={(value: "monthly" | "yearly") => setBillingCycle(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Music">Music</SelectItem>
            <SelectItem value="Productivity">Productivity</SelectItem>
            <SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
            <SelectItem value="News">News</SelectItem>
            <SelectItem value="Fitness">Fitness</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="next-billing">Next Billing Date</Label>
        <Input
          id="next-billing"
          type="date"
          value={nextBillingDate}
          onChange={(e) => setNextBillingDate(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Subscription"
        )}
      </Button>
    </form>
  )
}

export default EditSubscriptionForm
