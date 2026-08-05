import type { Metadata } from "next"
import { PolicyPage } from "@/components/marketing/policy-page"

export const metadata: Metadata = {
  title: "Refund Policy | CancelIt",
  description: "CancelIt refund policy, including the 7-day refund window.",
}

const sections = [
  {
    title: "7-day refund window",
    body: [
      "CancelIt offers refunds for paid subscriptions when the refund request is submitted within 7 calendar days of the initial purchase.",
      "Requests received after the 7-day window are not eligible for a refund unless required by applicable law.",
    ],
  },
  {
    title: "What is refundable",
    bullets: [
      "First-time payments for Starter, Plus, or Unlimited plans requested within 7 calendar days.",
      "Duplicate charges caused by a billing error, once verified by CancelIt or the payment processor.",
    ],
  },
  {
    title: "What is not refundable",
    bullets: [
      "Subscription renewals after the 7-day refund window.",
      "Partial billing periods after the paid plan has renewed.",
      "Charges from third-party merchants, banks, card issuers, or subscription providers found through Plaid.",
      "Fees, penalties, or merchant charges outside CancelIt's own subscription fee.",
    ],
  },
  {
    title: "How to request a refund",
    body: [
      "Email support@flowlog.dev with the email address on your CancelIt account, the plan purchased, the payment date, and the reason for the refund request.",
      "If the request is approved, the refund will be sent to the original payment method. Bank and processor timing can vary.",
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      description="This policy explains when CancelIt subscription payments can be refunded. The standard refund period is 7 calendar days from the initial purchase."
      sections={sections}
    />
  )
}
