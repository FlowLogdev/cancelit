import type { Metadata } from "next"
import { PolicyPage } from "@/components/marketing/policy-page"

export const metadata: Metadata = {
  title: "Privacy Policy | CancelIt",
  description: "How CancelIt collects, uses, and protects customer information.",
}

const sections = [
  {
    title: "Information we collect",
    body: [
      "CancelIt collects the information needed to create and manage your account, provide subscription tracking, process billing, and support your requests.",
    ],
    bullets: [
      "Account details such as name, email address, and profile information you provide.",
      "Read-only bank account, balance, and transaction data shared through Plaid after you authorize a connection.",
      "Subscription records, cancellation notes, preferences, usage activity, and support messages.",
      "Payment status and billing records from our payment processor. CancelIt does not store full card numbers.",
    ],
  },
  {
    title: "How we use information",
    bullets: [
      "Detect recurring charges and help you track subscriptions.",
      "Provide cancellation guidance, renewal reminders, savings suggestions, alerts, and customer support.",
      "Maintain security, prevent abuse, troubleshoot issues, and improve the product experience.",
      "Comply with legal, tax, accounting, and platform requirements.",
    ],
  },
  {
    title: "Plaid and bank credentials",
    body: [
      "Bank connections are handled through Plaid. CancelIt does not receive or store your bank login credentials. We only receive the read-only account and transaction data you authorize Plaid to share with CancelIt.",
    ],
  },
  {
    title: "Sharing information",
    body: [
      "CancelIt does not sell your personal information. We share information only with service providers that help us operate CancelIt, including hosting, database, authentication, analytics, support, Plaid, payment processing, and security providers, or when required by law.",
    ],
  },
  {
    title: "Retention and deletion",
    body: [
      "We retain account and subscription information while your account is active and as needed for support, security, legal, billing, and operational purposes. You can request deletion by contacting support@flowlog.dev.",
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      description="CancelIt is designed to help customers find, manage, and cancel recurring charges while keeping bank credentials outside of CancelIt's systems."
      sections={sections}
    />
  )
}
