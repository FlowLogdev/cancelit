import { CancelItLogo } from "@/components/brand/cancelit-logo"
import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.07] py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-white/42 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <CancelItLogo href="" showText={false} imageClassName="h-8 w-8 rounded-md" />
          <p>CancelIt. Subscription control for people who prefer fewer surprise charges.</p>
        </div>
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
  )
}
