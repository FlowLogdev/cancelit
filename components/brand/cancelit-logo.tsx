import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface CancelItLogoProps {
  href?: string
  className?: string
  imageClassName?: string
  textClassName?: string
  showText?: boolean
}

export function CancelItLogo({
  href = "/",
  className,
  imageClassName,
  textClassName,
  showText = true,
}: CancelItLogoProps) {
  const content = (
    <>
      <span
        className={cn(
          "relative block h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black shadow-sm shadow-red-500/15",
          imageClassName,
        )}
      >
        <Image
          src="/brand/cancelit-logo.jpg"
          alt="CancelIt App logo"
          fill
          sizes="64px"
          className="object-cover"
        />
      </span>
      {showText && (
        <span className={cn("text-xl font-black tracking-tight text-white", textClassName)}>
          Cancel<span className="text-red-500">It</span>
        </span>
      )}
    </>
  )

  if (!href) {
    return <div className={cn("inline-flex items-center gap-2.5", className)}>{content}</div>
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="CancelIt home"
    >
      {content}
    </Link>
  )
}
