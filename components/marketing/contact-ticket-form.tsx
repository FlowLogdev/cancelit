"use client"

import { CheckCircle2, Loader2, Mail, Send, Ticket } from "lucide-react"
import type { FormEvent } from "react"
import { useState } from "react"

const issueTypes = [
  "Billing Information",
  "Cannot Connect Plaid Account",
  "Cannot add subscription Manually",
  "Delete Account Number",
  "Cancel my Subscription",
  "Other",
]

type FormState = {
  customerName: string
  customerEmail: string
  issueType: string
  message: string
}

type SuccessState = {
  ticketNumber: string
  emailDelivered: boolean
  emailWarning: string | null
}

const initialForm: FormState = {
  customerName: "",
  customerEmail: "",
  issueType: issueTypes[0],
  message: "",
}

export function ContactTicketForm() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SuccessState | null>(null)

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to create support ticket")
      }

      setSuccess({
        ticketNumber: result.ticketNumber,
        emailDelivered: Boolean(result.emailDelivered),
        emailWarning: result.emailWarning || null,
      })
      setForm(initialForm)
    } catch (submitError: any) {
      setError(submitError.message || "Unable to create support ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-white/[0.1] bg-white/[0.045] p-5 shadow-2xl shadow-black/30 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-red-400/25 bg-red-500/12 text-red-200">
          <Ticket className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">Open a support ticket</h2>
          <p className="mt-1 text-sm leading-6 text-white/58">
            Submit the form and CancelIt will generate your ticket number immediately.
          </p>
        </div>
      </div>

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Ticket created
          </div>
          <p className="mt-2">
            Your ticket number is <span className="font-bold text-white">{success.ticketNumber}</span>.
          </p>
          <p className="mt-1 text-emerald-100/80">
            {success.emailDelivered
              ? "A copy was sent to you and to CancelIt support."
              : success.emailWarning || "Save this ticket number for your records."}
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 rounded-lg border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="text-sm font-semibold text-white">
            Customer name
          </label>
          <input
            id="customerName"
            name="customerName"
            value={form.customerName}
            onChange={(event) => updateField("customerName", event.target.value)}
            required
            className="mt-2 h-11 w-full rounded-md border border-white/[0.12] bg-black/55 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-400/70"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="text-sm font-semibold text-white">
            Email address
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              id="customerEmail"
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={(event) => updateField("customerEmail", event.target.value)}
              required
              className="h-11 w-full rounded-md border border-white/[0.12] bg-black/55 py-2 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-400/70"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="issueType" className="text-sm font-semibold text-white">
            Title of the issue
          </label>
          <select
            id="issueType"
            name="issueType"
            value={form.issueType}
            onChange={(event) => updateField("issueType", event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-white/[0.12] bg-black/55 px-3 text-sm text-white outline-none transition-colors focus:border-red-400/70"
          >
            {issueTypes.map((issueType) => (
              <option key={issueType} value={issueType}>
                {issueType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="text-sm font-semibold text-white">
            Details
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            required
            rows={6}
            className="mt-2 w-full resize-y rounded-md border border-white/[0.12] bg-black/55 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-red-400/70"
            placeholder="Describe what happened, the account email involved, and any visible error message. Do not send bank passwords, one-time passcodes, full account numbers, or card numbers."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-500/60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isSubmitting ? "Creating ticket" : "Submit ticket"}
        </button>
      </form>
    </div>
  )
}
