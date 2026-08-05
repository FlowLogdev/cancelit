import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Reveal } from "@/components/marketing/reveal"
import { CancelItBotWidget } from "@/components/marketing/cancelit-bot-widget"
import { SignupActivityToast } from "@/components/marketing/signup-activity-toast"
import { SiteNav } from "@/components/marketing/site-nav"
import { SiteFooter } from "@/components/marketing/site-footer"
import Threads from "@/components/threads"
import {
  ArrowRight,
  BadgeDollarSign,
  BellRing,
  Check,
  Coins,
  CreditCard,
  Eye,
  Landmark,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  TrendingDown,
} from "lucide-react"
import Link from "next/link"

const facts = [
  { icon: Coins, value: "$18.74", label: "average charge people forget they're paying" },
  { icon: TrendingDown, value: "6 months", label: "of transaction history reviewed on the first scan" },
  { icon: Eye, value: "Read-only", label: "bank access, brokered entirely through Plaid" },
]

const subscriptions = [
  { name: "Adobe Creative Cloud", amount: "$59.99", cadence: "renews Jan 28", status: "review", tone: "amber" },
  { name: "Dropbox", amount: "$11.99", cadence: "renews Feb 02", status: "duplicate", tone: "neutral" },
  { name: "Peacock", amount: "$7.99", cadence: "renews Feb 07", status: "cancel path found", tone: "red" },
  { name: "Spotify", amount: "$10.99", cadence: "renews Feb 11", status: "keep", tone: "green" },
] as const

const statusStyles: Record<(typeof subscriptions)[number]["tone"], string> = {
  amber: "bg-amber-500/10 text-amber-300",
  neutral: "bg-white/8 text-white/55",
  red: "bg-red-500/12 text-red-300",
  green: "bg-emerald-500/10 text-emerald-300",
}

const steps = [
  {
    number: "01",
    icon: <CreditCard className="h-5 w-5" />,
    title: "Connect your accounts",
    text: "Link a bank or card through Plaid. CancelIt never sees or stores your bank login.",
  },
  {
    number: "02",
    icon: <TrendingDown className="h-5 w-5" />,
    title: "Get a sorted list",
    text: "Recurring merchants are ranked by cost, renewal date, and how urgent cancelling is.",
  },
  {
    number: "03",
    icon: <BadgeDollarSign className="h-5 w-5" />,
    title: "Cancel with one request",
    text: "Send a cancellation request and track its status right next to the subscription.",
  },
]

const features = [
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Bank scan without bank credentials",
    description: "Plaid provides read-only transaction data, so we can spot recurring charges without ever touching your login.",
    span: true,
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Private by design",
    description: "Your bank credentials stay with Plaid. We only store what's needed to manage subscriptions.",
    tint: true,
  },
  {
    icon: <ReceiptText className="h-5 w-5" />,
    title: "A real cancellation queue",
    description: "Request a cancellation, see the next step, and keep the status attached to the subscription.",
  },
  {
    icon: <BellRing className="h-5 w-5" />,
    title: "Renewal warnings",
    description: "Renewal dates are sorted by urgency, so you review a charge before it happens, not after.",
  },
]

const plans = [
  {
    name: "Starter",
    price: "$4.99",
    description: "For a short personal list.",
    features: ["10 tracked subscriptions", "Plaid scan up to 10", "Renewal reminders"],
  },
  {
    name: "Plus",
    price: "$12.99",
    description: "Best for a full scan and savings help.",
    features: ["50 Plaid-detected subscriptions", "Savings assistant", "Cancellation guidance"],
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "$19.99",
    description: "For heavy cleanup and ongoing control.",
    features: ["Unlimited tracking", "Priority cancellation support", "Advanced reporting"],
  },
]

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <SignupActivityToast />
      <CancelItBotWidget />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
        <div
          className="absolute left-1/2 top-[-12rem] -translate-x-1/2 opacity-80"
          style={{ width: "1080px", height: "1080px", position: "relative" }}
        >
          <Threads color={[0.32, 0.15, 1]} amplitude={1} distance={0} enableMouseInteraction />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(82,38,255,0.24),transparent_30%),linear-gradient(to_bottom,rgba(0,0,0,0.08),#000_78%)]" />
      </div>

      <SiteNav />

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:pt-20">
        <div>
          <span className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/70">
            Know before you're charged
          </span>

          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Stop paying for subscriptions you forgot.
          </h1>

          <p className="mt-6 max-w-md text-pretty text-lg leading-8 text-white/58">
            Connect your bank, see every recurring charge in one list, and cancel the ones you don't need.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="h-12 gap-2 bg-red-500 px-7 font-semibold text-white hover:bg-red-600">
                Start free scan <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/15 bg-white/[0.04] px-7 text-white hover:bg-white/[0.08]"
              >
                See pricing
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-red-500/10 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]/95 shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <CancelItLogo href="" showText={false} imageClassName="h-10 w-10 rounded-xl" />
                <div>
                  <p className="text-xs font-medium text-white/34">Sample dashboard</p>
                  <h2 className="mt-1 text-xl font-semibold">Review queue</h2>
                </div>
              </div>
              <div className="rounded-full bg-red-500/12 px-2.5 py-1 text-xs font-medium text-red-200">
                $90.96/mo
              </div>
            </div>

            <div className="space-y-3 p-4">
              {subscriptions.map((item) => (
                <div key={item.name} className="grid grid-cols-[1fr_auto] gap-4 rounded-xl bg-white/[0.045] p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyles[item.tone]}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-white/42">{item.cadence}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">{item.amount}</p>
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

      <section className="relative z-10 border-y border-white/[0.07] bg-black/55 backdrop-blur-sm">
        <Reveal className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-red-300">
                <fact.icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-2xl font-bold tabular-nums">{fact.value}</div>
                <div className="mt-1 text-sm leading-5 text-white/48">{fact.label}</div>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <p className="text-center text-sm text-white/40">Built on infrastructure you already trust</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-14 gap-y-6 opacity-80 grayscale">
          <span className="text-2xl font-bold tracking-tight text-white">plaid</span>
          <div className="flex items-center gap-2">
            <img src="https://cdn.simpleicons.org/stripe/ffffff" alt="" className="h-6 w-6" />
            <span className="text-lg font-semibold text-white">Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="https://cdn.simpleicons.org/supabase/ffffff" alt="" className="h-6 w-6" />
            <span className="text-lg font-semibold text-white">Supabase</span>
          </div>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal className="grid gap-10 sm:grid-cols-3 sm:divide-x sm:divide-white/[0.08]">
          {steps.map((step) => (
            <article key={step.title} className="relative sm:px-8 sm:first:pl-0">
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 right-0 select-none font-mono text-7xl font-bold text-white/[0.04] sm:right-4"
              >
                {step.number}
              </span>
              <div className="relative mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/12 text-red-300">
                {step.icon}
              </div>
              <h3 className="relative text-lg font-semibold">{step.title}</h3>
              <p className="relative mt-3 text-sm leading-6 text-white/52">{step.text}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black tracking-tight">A focused subscription command center.</h2>
          <p className="mt-4 text-pretty leading-7 text-white/54">
            The web app handles the core product first: scanning, cancellation requests, and the savings assistant.
          </p>
        </div>

        <Reveal delay={0.1} className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`rounded-2xl border border-white/[0.08] p-6 ${
                feature.span ? "lg:col-span-2 bg-gradient-to-br from-red-500/[0.08] via-[#101010] to-[#101010]" : ""
              } ${feature.tint ? "bg-white/[0.035]" : ""} ${!feature.span && !feature.tint ? "bg-[#101010]" : ""}`}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-red-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-white/50">{feature.description}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Simple web plans.</h2>
            <p className="mt-2 text-sm text-white/48">A free plan is also available.</p>
          </div>
          <Link href="/pricing" className="text-sm font-medium text-white/60 hover:text-white">
            See pricing <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>

        <Reveal delay={0.1} className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex min-h-[320px] flex-col rounded-2xl p-6 ${
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
        </Reveal>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <Reveal className="grid gap-6 rounded-2xl border border-white/[0.08] bg-[#101010] p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
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
              Start free scan
            </Button>
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  )
}
