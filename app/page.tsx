import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  ArrowRight,
  Banknote,
  BellRing,
  CreditCard,
  Lock,
  Search,
  Shield,
  TrendingDown,
  X,
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight">
            Cancel<span className="text-red-500">It</span>
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/signin">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white gap-1.5 font-semibold"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-red-500/8 rounded-full blur-[130px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Auto-detect subscriptions with bank scanning via Plaid
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.04] mb-6">
          Stop paying for
          <br />
          <span className="text-red-500">subscriptions you forgot</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          CancelIt connects to your bank, scans every transaction, and surfaces every hidden
          subscription — even the ones draining you silently each month.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white gap-2 h-12 px-8 text-base font-semibold"
            >
              Scan My Subscriptions <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base"
            >
              See How It Works
            </Button>
          </a>
        </div>

        <div className="grid grid-cols-3 max-w-sm mx-auto gap-6">
          {[
            { value: "$240", label: "avg. saved / year" },
            { value: "2 min", label: "to connect bank" },
            { value: "256-bit", label: "encryption" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A] p-8 md:p-12">
          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            The Problem
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The average person wastes{" "}
            <span className="text-red-500">$237/year</span> on forgotten subscriptions
          </h2>
          <p className="text-white/50 text-lg leading-relaxed max-w-2xl">
            Free trials that auto-renewed. Apps you downloaded once. Services you switched away from.
            They keep charging — silently — every single month.
          </p>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { icon: "🎵", name: "Music streaming", amount: "$9.99/mo" },
              { icon: "📺", name: "Video streaming", amount: "$15.99/mo" },
              { icon: "☁️", name: "Cloud storage", amount: "$2.99/mo" },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-white/40">Often forgotten</div>
                  </div>
                </div>
                <div className="text-red-400 text-sm font-semibold">{item.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            How It Works
          </div>
          <h2 className="text-4xl font-bold">Three steps to total clarity</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              step: "01",
              icon: <CreditCard className="h-5 w-5" />,
              title: "Connect Your Bank",
              description:
                "Securely link your bank via Plaid — the same technology trusted by Venmo, Robinhood, and millions of apps.",
            },
            {
              step: "02",
              icon: <Search className="h-5 w-5" />,
              title: "We Find Everything",
              description:
                "Our scanner analyzes 12 months of transactions and identifies every recurring charge, even ones you've forgotten.",
            },
            {
              step: "03",
              icon: <X className="h-5 w-5" />,
              title: "Cancel What You Don't Need",
              description:
                "Review all your subscriptions and cancel the ones draining your money — right from your dashboard in seconds.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="relative p-6 rounded-2xl border border-white/[0.07] bg-[#0A0A0A] hover:border-red-500/25 transition-colors"
            >
              <div className="text-6xl font-black text-white/[0.04] absolute top-4 right-5 select-none leading-none">
                {s.step}
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-5">
                {s.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            Features
          </div>
          <h2 className="text-4xl font-bold">Everything you need to take control</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              icon: <Banknote className="h-5 w-5" />,
              title: "Bank-Level Subscription Detection",
              description:
                "Powered by Plaid, we analyze your transaction history to surface every recurring charge — Netflix, Spotify, gym memberships, SaaS tools, and hundreds more.",
            },
            {
              icon: <BellRing className="h-5 w-5" />,
              title: "Renewal Alerts",
              description:
                "Get notified 3 days before any subscription renews so you're never surprised by an unexpected charge.",
            },
            {
              icon: <TrendingDown className="h-5 w-5" />,
              title: "Spending Analytics",
              description:
                "See exactly how much you spend on subscriptions broken down by month, category, and trend over time.",
            },
            {
              icon: <Shield className="h-5 w-5" />,
              title: "Bank-Grade Security",
              description:
                "256-bit encryption. We never store your bank credentials. Plaid provides read-only access — we can see but never touch your money.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-white/[0.07] bg-[#0A0A0A] hover:border-white/[0.12] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-4">
            Pricing
          </div>
          <h2 className="text-4xl font-bold">Start free, upgrade when ready</h2>
          <p className="text-white/45 mt-3">No credit card required to get started</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              name: "Free",
              price: "$0",
              description: "Perfect for getting started",
              features: [
                "Track up to 5 subscriptions",
                "Manual entry only",
                "Basic spending overview",
                "Email support",
              ],
              cta: "Get Started Free",
              popular: false,
            },
            {
              name: "Starter",
              price: "$4.99",
              description: "For individuals who want full control",
              features: [
                "Unlimited subscriptions",
                "Bank scanning via Plaid",
                "Auto-detect all subscriptions",
                "Renewal alerts",
                "Spending analytics",
                "Priority support",
              ],
              cta: "Start Free Trial",
              popular: true,
            },
            {
              name: "Pro",
              price: "$9.99",
              description: "For power users and families",
              features: [
                "Everything in Starter",
                "Up to 5 bank accounts",
                "Custom categories",
                "Export data (CSV / PDF)",
                "API access",
                "24/7 priority support",
              ],
              cta: "Get Pro",
              popular: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? "border-2 border-red-500 bg-[#100808]"
                  : "border border-white/[0.07] bg-[#0A0A0A]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500 text-white text-xs font-semibold whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-medium text-white/60 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "$0" && (
                    <span className="text-white/40 text-sm">/month</span>
                  )}
                </div>
                <p className="text-white/45 text-sm mt-2">{plan.description}</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <svg
                      className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/65">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button
                  className={`w-full h-10 font-semibold ${
                    plan.popular
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Security Trust Bar ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-white/[0.07] bg-[#0A0A0A] px-8 py-6">
          <div className="flex flex-wrap gap-8 items-center justify-center md:justify-between text-sm text-white/45">
            {[
              { icon: <Lock className="h-4 w-4" />, label: "256-bit SSL encryption" },
              { icon: <Shield className="h-4 w-4" />, label: "Read-only bank access" },
              { icon: <Lock className="h-4 w-4" />, label: "We never store credentials" },
              { icon: <Shield className="h-4 w-4" />, label: "Plaid-secured connections" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2">
                <span className="text-red-500/70">{t.icon}</span>
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="relative rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/25 to-black p-10 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How much are you losing
            <br />
            every month?
          </h2>
          <p className="text-white/50 text-lg mb-8 max-w-lg mx-auto">
            Find out in 2 minutes. Connect your bank, see every subscription, cancel the ones you
            don't need.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-red-500 hover:bg-red-600 text-white h-12 px-10 text-base font-semibold gap-2"
            >
              Find My Forgotten Subscriptions <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-white/25 text-sm mt-4">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-black tracking-tight">
            Cancel<span className="text-red-500">It</span>
          </span>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/plans" className="hover:text-white/70 transition-colors">
              Pricing
            </Link>
            <Link href="/signin" className="hover:text-white/70 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-white/70 transition-colors">
              Get Started
            </Link>
          </div>
          <p className="text-white/25 text-sm">© {new Date().getFullYear()} CancelIt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
