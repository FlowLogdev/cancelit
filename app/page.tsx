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
  Sparkles,
  TrendingDown,
  WalletCards,
} from "lucide-react"
import Link from "next/link"

const stats = [
  { value: "$237", label: "average annual waste found" },
  { value: "90 sec", label: "typical bank connection" },
  { value: "Read-only", label: "Plaid bank access" },
]

const subscriptions = [
  { name: "Netflix", amount: "$22.99", cadence: "monthly", status: "active" },
  { name: "Adobe Creative Cloud", amount: "$59.99", cadence: "monthly", status: "review" },
  { name: "Dropbox", amount: "$11.99", cadence: "monthly", status: "duplicate" },
  { name: "Peacock", amount: "$7.99", cadence: "monthly", status: "unused" },
]

const features = [
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Plaid-powered discovery",
    description: "Connect checking and card accounts, then let CancelIt find recurring charges from transaction history.",
  },
  {
    icon: <ReceiptText className="h-5 w-5" />,
    title: "Subscription tracker",
    description: "Track cost, renewal date, status, category, and notes from one quiet dashboard.",
  },
  {
    icon: <BellRing className="h-5 w-5" />,
    title: "Renewal warnings",
    description: "Get ahead of upcoming renewals before a trial or forgotten plan charges again.",
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
    description: "For getting control of a personal subscription list.",
    features: ["10 tracked subscriptions", "Email reminders", "Basic spending view"],
  },
  {
    name: "Medium",
    price: "$9.99",
    description: "For households and heavy app users.",
    features: ["50 tracked subscriptions", "Plaid bank scan", "Exportable reports"],
    highlighted: true,
  },
  {
    name: "Maximum",
    price: "$19.99",
    description: "For power users and small teams.",
    features: ["Unlimited tracking", "Advanced insights", "Priority support"],
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

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-200">
            <Sparkles className="h-3.5 w-3.5" />
            Pay only for the plan you use. Upgrade when the scan pays for itself.
          </div>

          <h1 className="max-w-4xl text-balance text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Find the quiet charges hiding in your bank account.
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/58">
            CancelIt connects through Plaid, detects recurring payments, and gives customers a clear web dashboard to
            keep, pause, or cancel every subscription they no longer need.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-12 gap-2 bg-red-500 px-7 font-semibold text-white hover:bg-red-600">
                Connect and scan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white/[0.08]"
              >
                View web plans
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
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111]/92 shadow-2xl shadow-red-950/20">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-300">Live scan</p>
                <h2 className="mt-1 text-xl font-semibold">Recurring charges</h2>
              </div>
              <div className="rounded-md bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                4 found
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
                    <p className="mt-1 text-sm text-white/42">{item.cadence} billing</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{item.amount}</p>
                    <p className="mt-1 text-xs text-red-200">review</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 border-t border-white/10">
              {[
                { label: "Monthly", value: "$102.96" },
                { label: "Annual", value: "$1,235.52" },
                { label: "Potential cut", value: "$431.88" },
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
              text: "Customers link a bank or card account through Plaid with read-only access.",
            },
            {
              icon: <TrendingDown className="h-5 w-5" />,
              title: "2. Detect",
              text: "CancelIt groups recurring merchants and highlights waste, duplicates, and upcoming renewals.",
            },
            {
              icon: <BadgeDollarSign className="h-5 w-5" />,
              title: "3. Manage",
              text: "Users track what stays, what goes, and what needs a reminder before the next charge.",
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
            The first release should feel trustworthy on desktop and mobile web before we package the same product logic
            into iOS and Android apps.
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
              Start with the web app. Once the core flow is stable, the same Supabase, Plaid, and Stripe foundation can
              support iOS and Android.
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
