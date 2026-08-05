import type { Metadata } from "next"
import { PolicyPage } from "@/components/marketing/policy-page"

export const metadata: Metadata = {
  title: "Contact Information | CancelIt",
  description: "How to contact CancelIt for support, billing, refunds, and cancellation help.",
}

const sections = [
  {
    title: "Primary support contact",
    body: [
      "For account, billing, refund, subscription, cancellation, or Plaid connection support, email support@flowlog.dev.",
      "Our website is https://cancelit.app.",
    ],
  },
  {
    title: "Billing and refund support",
    body: [
      "For billing or refund questions, include the email address on your CancelIt account, your plan name, payment date, and a short description of the issue.",
    ],
  },
  {
    title: "Plaid connection support",
    body: [
      "For bank connection issues, include the institution name, approximate time of the attempt, browser or device used, and any visible error message. Do not send bank passwords, one-time passcodes, full account numbers, or full card numbers.",
    ],
  },
  {
    title: "Cancellation help",
    body: [
      "For help canceling a third-party subscription, include the merchant name, renewal date, amount, and the email address or username used with that merchant if you know it.",
    ],
  },
]

export default function ContactPage() {
  return (
    <PolicyPage
      title="Contact Information"
      description="Use this page to contact CancelIt support and send the right details for faster help."
      sections={sections}
    />
  )
}
