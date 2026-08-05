import type { Metadata } from "next"
import { PolicyPage } from "@/components/marketing/policy-page"

export const metadata: Metadata = {
  title: "Cancellation Policy | CancelIt",
  description: "CancelIt subscription cancellation terms and third-party cancellation guidance.",
}

const sections = [
  {
    title: "Canceling your CancelIt plan",
    body: [
      "You can cancel your paid CancelIt subscription at any time from your account settings or by contacting support@flowlog.dev.",
      "When you cancel, your paid access continues until the end of the current billing period unless applicable law requires otherwise.",
    ],
  },
  {
    title: "Renewals",
    body: [
      "Paid plans renew automatically until canceled. Cancel before the next renewal date to avoid the next subscription charge.",
    ],
  },
  {
    title: "Third-party subscriptions",
    body: [
      "Canceling CancelIt does not automatically cancel subscriptions you have with third-party merchants, apps, streaming services, banks, lenders, or other providers.",
      "CancelIt can help identify recurring charges and provide cancellation guidance, but the final cancellation for a third-party service may need to be completed directly with that merchant or provider.",
    ],
  },
  {
    title: "Refunds after cancellation",
    body: [
      "Refunds are governed by the CancelIt Refund Policy. The standard refund window is 7 calendar days from the initial purchase.",
    ],
  },
]

export default function CancellationPolicyPage() {
  return (
    <PolicyPage
      title="Cancellation Policy"
      description="This policy explains how to cancel your CancelIt plan and how third-party subscription cancellations are handled."
      sections={sections}
    />
  )
}
