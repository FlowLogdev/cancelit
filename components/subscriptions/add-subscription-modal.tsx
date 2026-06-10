"use client"

import { useState, useTransition } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMonths, addYears, formatISO } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

/**
 * Schema for a new subscription.
 */
const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  amount: z.coerce.number().positive(),
  interval: z.enum(["monthly", "yearly"]),
  first_billed_at: z.coerce.date(),
})

export type NewSubscription = z.infer<typeof schema>

interface AddSubscriptionModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function AddSubscriptionModal({ open, onOpenChange, onSuccess }: AddSubscriptionModalProps) {
  const supabase = createClient<Database>()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, startTransition] = useTransition()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Local form state
  const [form, setForm] = useState<NewSubscription>({
    name: "",
    amount: 0,
    interval: "monthly",
    first_billed_at: new Date(),
  })

  function updateField<K extends keyof NewSubscription>(key: K, value: NewSubscription[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit() {
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: parsed.error.errors.map((e) => e.message).join(", "),
      })
      return
    }

    startTransition(async () => {
      const { error } = await supabase.from("subscriptions").insert({
        ...parsed.data,
        next_billing_at: formatISO(
          parsed.data.interval === "monthly"
            ? addMonths(parsed.data.first_billed_at, 1)
            : addYears(parsed.data.first_billed_at, 1),
        ),
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: error.message,
        })
      } else {
        toast({ title: "Subscription added" })
        setIsOpen(false)
        if (onSuccess) {
          onSuccess()
        }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Subscription</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Netflix"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="9.99"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="interval">Interval</Label>
              <select
                id="interval"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
                value={form.interval}
                onChange={(e) => updateField("interval", e.target.value as NewSubscription["interval"])}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_billed_at">First billed at</Label>
            <Input
              id="first_billed_at"
              type="date"
              value={form.first_billed_at.toISOString().slice(0, 10)}
              onChange={(e) => updateField("first_billed_at", new Date(e.target.value))}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button disabled={loading} onClick={submit}>
            {loading ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubscriptionModal
