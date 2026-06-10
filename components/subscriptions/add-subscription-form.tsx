"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { addSubscription } from "@/lib/subscriptions"
import { getNextBillingDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { SubscriptionInsert } from "@/lib/types"

interface AddSubscriptionFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const categories = [
  "Entertainment",
  "Software",
  "Music",
  "News",
  "Fitness",
  "Food",
  "Shopping",
  "Education",
  "Business",
  "Other",
]

export function AddSubscriptionForm({ isOpen, onClose, onSuccess }: AddSubscriptionFormProps) {
  const [name, setName] = useState("")
  const [cost, setCost] = useState("")
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly" | "weekly">("monthly")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!name.trim() || !cost || !category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const costNumber = Number.parseFloat(cost)
    if (isNaN(costNumber) || costNumber <= 0) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid cost amount",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const subscriptionData: SubscriptionInsert = {
        user_id: user.id,
        name: name.trim(),
        cost: costNumber,
        billing_cycle: billingCycle,
        category,
        next_billing_date: getNextBillingDate(billingCycle),
        status: "active",
      }

      await addSubscription(subscriptionData)

      toast({
        title: "Success",
        description: "Subscription added successfully",
      })

      // Reset form
      setName("")
      setCost("")
      setBillingCycle("monthly")
      setCategory("")

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subscription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Cost *</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing-cycle">Billing Cycle *</Label>
            <Select
              value={billingCycle}
              onValueChange={(value: "monthly" | "yearly" | "weekly") => setBillingCycle(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Subscription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubscriptionForm
