import { CancelItLogo } from "@/components/brand/cancelit-logo"
import Link from "next/link"

const footerLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cancellation-policy", label: "Cancellation Policy" },
  { href: "/contact", label: "Contact Information" },
  { href: "/signin", label: "Sign in" },
]

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 text-sm text-white/42 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-xl items-center gap-3">
          <CancelItLogo href="" showText={false} imageClassName="h-8 w-8 rounded-md" />
          <p>CancelIt. Subscription control for people who prefer fewer surprise charges.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
