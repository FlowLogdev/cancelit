"use client"

import { useState, useTransition } from "react"
import { addMonths, addWeeks, addYears, formatISO } from "date-fns"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  cost: z.coerce.number().positive("Amount must be greater than zero"),
  billing_cycle: z.enum(["weekly", "monthly", "yearly"]),
  first_billed_at: z.coerce.date(),
})

export type NewSubscription = z.infer<typeof schema>

interface AddSubscriptionModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

function getNextBillingDate(firstBilledAt: Date, billingCycle: NewSubscription["billing_cycle"]) {
  if (billingCycle === "weekly") return addWeeks(firstBilledAt, 1)
  if (billingCycle === "yearly") return addYears(firstBilledAt, 1)
  return addMonths(firstBilledAt, 1)
}

export function AddSubscriptionModal({ open, onOpenChange, onSuccess }: AddSubscriptionModalProps) {
  const supabase = createClient<Database>()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, startTransition] = useTransition()

  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  const [form, setForm] = useState<NewSubscription>({
    name: "",
    cost: 0,
    billing_cycle: "monthly",
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
        description: parsed.error.errors.map((error) => error.message).join(", "),
      })
      return
    }

    startTransition(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          variant: "destructive",
          title: "Sign in required",
          description: "Please sign in before adding subscriptions.",
        })
        return
      }

      const nextBillingDate = getNextBillingDate(parsed.data.first_billed_at, parsed.data.billing_cycle)

      const { error } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        name: parsed.data.name,
        cost: parsed.data.cost,
        amount: parsed.data.cost,
        billing_cycle: parsed.data.billing_cycle,
        next_billing_date: formatISO(nextBillingDate, { representation: "date" }),
        status: "active",
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong",
          description: error.message,
        })
        return
      }

      toast({ title: "Subscription added" })
      setIsOpen(false)
      onSuccess?.()
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add subscription</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add subscription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Netflix" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="cost">Amount</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="9.99"
                value={form.cost}
                onChange={(e) => updateField("cost", Number(e.target.value))}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="billing_cycle">Interval</Label>
              <select
                id="billing_cycle"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none"
                value={form.billing_cycle}
                onChange={(e) => updateField("billing_cycle", e.target.value as NewSubscription["billing_cycle"])}
              >
                <option value="weekly">Weekly</option>
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
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubscriptionModal
