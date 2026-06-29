import { Button } from "@/components/ui/button"
import Threads from "@/components/threads"
import {
  ArrowRight,
  BadgeDollarSign,
  BellRing,
  Check,
  CreditCard,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
  WalletCards,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { value: "$18.74", label: "one small charge people miss" },
  { value: "6 mo", label: "history reviewed on first scan" },
  { value: "Read-only", label: "bank access through Plaid" },
]

const subscriptions = [
  { name: "Adobe Creative Cloud", amount: "$59.99", cadence: "renews Jan 28", status: "review first" },
  { name: "Dropbox", amount: "$11.99", cadence: "renews Feb 02", status: "duplicate" },
  { name: "Peacock", amount: "$7.99", cadence: "renews Feb 07", status: "cancel path found" },
  { name: "Spotify", amount: "$10.99", cadence: "renews Feb 11", status: "keep" },
]

const features = [
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Bank scan without bank credentials",
    description: "Plaid gives CancelIt read-only transaction data so customers can spot recurring card and bank charges.",
  },
  {
    icon: <ReceiptText className="h-5 w-5" />,
    title: "A real cancellation queue",
    description: "Customers can request cancellation, see the next step, and keep the status with the subscription record.",
  },
  {
    icon: <BellRing className="h-5 w-5" />,
    title: "Renewal warnings",
    description: "Renewal dates are sorted by urgency so customers review the next charge before it happens.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Private by design",
    description: "Bank credentials stay with Plaid. CancelIt only stores the data required to manage subscriptions.",
  },
]

const plans = [
  {
    name: "Minimum",
    price: "$4.99",
    description: "For a short personal list.",
    features: ["10 tracked subscriptions", "Plaid scan up to 10", "Basic reminders"],
  },
  {
    name: "Medium",
    price: "$9.99",
    description: "For households and heavy app users.",
    features: ["50 Plaid-detected subscriptions", "Savings assistant", "Cancellation guidance"],
    highlighted: true,
  },
  {
    name: "Maximum",
    price: "$19.99",
    description: "For power users and small teams.",
    features: ["Unlimited tracking", "Priority cancellation support", "Advanced reporting"],
  },
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
        <div
          className="absolute left-1/2 top-[-12rem] -translate-x-1/2 opacity-80"
          style={{ width: "1080px", height: "1080px", position: "relative" }}
        >
          <Threads color={[0.32, 0.15, 1]} amplitude={1} distance={0} enableMouseInteraction />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(82,38,255,0.24),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.08),#000_78%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-black/82 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="CancelIt home">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500 text-white">
              <WalletCards className="h-4 w-4" />
            </span>
            <span className="text-xl font-black tracking-tight">
              Cancel<span className="text-red-500">It</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#how" className="text-sm text-white/58 transition-colors hover:text-white">
              How it works
            </a>
            <a href="#features" className="text-sm text-white/58 transition-colors hover:text-white">
              Features
            </a>
            <a href="#pricing" className="text-sm text-white/58 transition-colors hover:text-white">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/signin">
              <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/8 hover:text-white">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 bg-red-500 font-semibold text-white hover:bg-red-600">
                Start scan <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:pb-24 lg:pt-16">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 py-1.5 text-sm font-medium text-white/62">
            Subscription audit for cards and bank accounts
          </div>

          <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Stop paying for services you forgot were still billing.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/58">
            CancelIt turns recurring transactions into a working list: what renews next, what costs the most, and what
            needs a cancellation request before another charge posts.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-12 gap-2 bg-red-500 px-7 font-semibold text-white hover:bg-red-600">
                Start the audit <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white/[0.08]"
              >
                Compare plans
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l border-white/10 pl-4">
                <div className="text-2xl font-bold tabular-nums">{stat.value}</div>
                <div className="mt-1 text-xs leading-5 text-white/42">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-red-500/10 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]/95 shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/34">Sample dashboard</p>
                <h2 className="mt-1 text-xl font-semibold">Review queue</h2>
              </div>
              <div className="rounded-md bg-red-500/12 px-2.5 py-1 text-xs font-medium text-red-200">
                $90.96/mo
              </div>
            </div>

            <div className="space-y-3 p-4">
              {subscriptions.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_auto] gap-4 rounded-lg bg-white/[0.045] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="rounded bg-white/8 px-1.5 py-0.5 text-[11px] text-white/50">{item.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-white/42">{item.cadence}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{item.amount}</p>
                    <p className="mt-1 text-xs text-red-200">action</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 border-t border-white/10">
              {[
                { label: "Monthly", value: "$90.96" },
                { label: "Annual", value: "$1,091.52" },
                { label: "Review first", value: "$79.97" },
              ].map((item) => (
                <div key={item.label} className="p-4">
                  <p className="text-xs text-white/38">{item.label}</p>
                  <p className="mt-1 font-semibold tabular-nums">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 border-y border-white/[0.07] bg-black/55 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3">
          {[
            {
              icon: <CreditCard className="h-5 w-5" />,
              title: "1. Connect",
              text: "Customers link a bank or card account through Plaid. CancelIt never receives bank login details.",
            },
            {
              icon: <TrendingDown className="h-5 w-5" />,
              title: "2. Sort",
              text: "Recurring merchants are ranked by cost, renewal date, and cancellation urgency.",
            },
            {
              icon: <BadgeDollarSign className="h-5 w-5" />,
              title: "3. Request",
              text: "Users can request cancellation guidance and keep each request attached to the subscription.",
            },
          ].map((step) => (
            <article key={step.title} className="rounded-xl bg-[#101010] p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-red-500/12 text-red-300">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/52">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-red-300">Built for the web first</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">A focused subscription command center.</h2>
          <p className="mt-4 text-pretty leading-7 text-white/54">
            The web app handles the core product first: scanning, tier limits, cancellation requests, and the savings
            assistant. The same backend can later power iOS and Android.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-white/[0.08] bg-[#101010] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-white/[0.06] text-red-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-red-300">Stripe checkout ready</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Simple web plans.</h2>
          </div>
          <Link href="/pricing" className="text-sm font-medium text-white/60 hover:text-white">
            Open pricing page <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex min-h-[320px] flex-col rounded-xl p-6 ${
                plan.highlighted ? "bg-red-500 text-white" : "border border-white/[0.08] bg-[#101010]"
              }`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className={`mt-2 text-sm leading-6 ${plan.highlighted ? "text-white/78" : "text-white/50"}`}>
                  {plan.description}
                </p>
                <p className="mt-6 text-4xl font-black tabular-nums">
                  {plan.price}
                  <span className="text-sm font-medium opacity-70">/mo</span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/pricing" className="mt-8">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-white text-red-600 hover:bg-white/90"
                      : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
                  }`}
                >
                  Choose {plan.name}
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid gap-6 rounded-2xl border border-white/[0.08] bg-[#101010] p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-red-200">
              <LockKeyhole className="h-4 w-4" />
              Bank credentials are never stored by CancelIt
            </div>
            <h2 className="text-3xl font-black tracking-tight">Ready to scan the first account?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/52">
              Start with the web app, prove the savings workflow, then package the same Supabase, Plaid, and Stripe
              foundation into iOS and Android.
            </p>
          </div>
          <Link href="/signup">
            <Button size="lg" className="h-12 bg-red-500 px-7 font-semibold text-white hover:bg-red-600">
              Create account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.07] py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-white/42 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>CancelIt. Subscription control for people who prefer fewer surprise charges.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="hover:text-white">
              Pricing
            </Link>
            <Link href="/signin" className="hover:text-white">
              Sign in
            </Link>
            <a href="mailto:support@flowlog.dev" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
