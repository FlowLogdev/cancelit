import type { Metadata } from "next"

import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { ContactTicketForm } from "@/components/marketing/contact-ticket-form"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteNav } from "@/components/marketing/site-nav"

export const metadata: Metadata = {
  title: "Contact Information | CancelIt",
  description: "Contact CancelIt support for billing, Plaid connection, manual subscription, account, or cancellation help.",
}

const supportTopics = [
  "Billing and refund questions",
  "Plaid account connection issues",
  "Manual subscription entry problems",
  "Account deletion requests",
  "CancelIt subscription cancellation",
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav logoHref="/dashboard" />

      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
          <div className="space-y-8">
            <div className="space-y-5">
              <CancelItLogo href="/dashboard" imageClassName="h-12 w-12" textClassName="text-3xl" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-300">Contact Information</p>
                <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Get a tracked CancelIt support ticket.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/64">
                  Use this form for account, billing, Plaid, manual subscription, deletion, or cancellation issues.
                  We will generate a ticket number immediately and email copies to you and CancelIt support.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/[0.1] bg-white/[0.035] p-5">
              <h2 className="text-lg font-bold text-white">Support email</h2>
              <a href="mailto:support@flowlog.dev" className="mt-2 block text-base font-semibold text-red-200">
                support@flowlog.dev
              </a>
              <p className="mt-3 text-sm leading-6 text-white/56">
                The ticket form is preferred because it creates a reference number and sends both copies automatically.
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.1] bg-white/[0.035] p-5">
              <h2 className="text-lg font-bold text-white">What we can help with</h2>
              <ul className="mt-4 grid gap-3 text-sm text-white/64">
                {supportTopics.map((topic) => (
                  <li key={topic} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContactTicketForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
