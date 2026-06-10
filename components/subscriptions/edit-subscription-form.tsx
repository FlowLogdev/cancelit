"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Calendar, DollarSign, Globe, Tag } from "lucide-react"

interface Subscription {
  id: string
  name: string
  cost: number
  billing_cycle: string
  next_billing_date: string
  status: string
  category?: string
  description?: string
  website_url?: string
  cancellation_url?: string
}

interface EditSubscriptionFormProps {
  subscription: Subscription
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubscriptionUpdated: () => void
}

export function EditSubscriptionForm({
  subscription,
  open,
  onOpenChange,
  onSubscriptionUpdated,
}: EditSubscriptionFormProps) {
  const { toast } = useToast()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    billing_cycle: "",
    next_billing_date: "",
    status: "",
    category: "",
    description: "",
    website_url: "",
    cancellation_url: "",
  })

  const categories = [
    "Entertainment",
    "Software",
    "Music",
    "News",
    "Fitness",
    "Food & Drink",
    "Shopping",
    "Productivity",
    "Education",
    "Gaming",
    "Other",
  ]

  const billingCycles = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "weekly", label: "Weekly" },
    { value: "daily", label: "Daily" },
  ]

  const statuses = [
    { value: "active", label: "Active" },
    { value: "cancelled", label: "Cancelled" },
    { value: "paused", label: "Paused" },
  ]

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        cost: subscription.cost.toString(),
        billing_cycle: subscription.billing_cycle,
        next_billing_date: subscription.next_billing_date,
        status: subscription.status,
        category: subscription.category || "",
        description: subscription.description || "",
        website_url: subscription.website_url || "",
        cancellation_url: subscription.cancellation_url || "",
      })
    }
  }, [subscription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          name: formData.name,
          cost: Number.parseFloat(formData.cost),
          billing_cycle: formData.billing_cycle,
          next_billing_date: formData.next_billing_date,
          status: formData.status,
          category: formData.category || null,
          description: formData.description || null,
          website_url: formData.website_url || null,
          cancellation_url: formData.cancellation_url || null,
        })
        .eq("id", subscription.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Subscription updated successfully",
      })

      onSubscriptionUpdated()
      onOpenChange(false)
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>Update your subscription details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Netflix, Spotify, Adobe"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => handleInputChange("billing_cycle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  {billingCycles.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="next_billing_date">Next Billing Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="next_billing_date"
                  type="date"
                  value={formData.next_billing_date}
                  onChange={(e) => handleInputChange("next_billing_date", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Select category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this subscription"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={formData.website_url}
                onChange={(e) => handleInputChange("website_url", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_url">Cancellation URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="cancellation_url"
                type="url"
                placeholder="https://example.com/cancel"
                value={formData.cancellation_url}
                onChange={(e) => handleInputChange("cancellation_url", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />}
              Update Subscription
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
