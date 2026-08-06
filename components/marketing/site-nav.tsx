import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface SiteNavProps {
  logoHref?: string
}

export function SiteNav({ logoHref = "/" }: SiteNavProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.07] bg-black/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <CancelItLogo href={logoHref} imageClassName="h-9 w-9" />

        <div className="hidden items-center gap-7 md:flex">
          <Link href="/#how" className="text-sm text-white/58 transition-colors hover:text-white">
            How it works
          </Link>
          <Link href="/#features" className="text-sm text-white/58 transition-colors hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-white/58 transition-colors hover:text-white">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/signin">
            <Button variant="ghost" size="sm" className="text-white/70 hover:bg-white/8 hover:text-white">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="gap-1.5 bg-red-500 font-semibold text-white hover:bg-red-600">
              Start free scan <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
