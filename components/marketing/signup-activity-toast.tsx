"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"

const SIGNUP_ACTIVITY = [
  { name: "Sofia Martins", city: "Miami" },
  { name: "Daniel Brooks", city: "Austin" },
  { name: "Isabella Costa", city: "Orlando" },
  { name: "Marcus Bennett", city: "Atlanta" },
  { name: "Camila Reyes", city: "Tampa" },
  { name: "Ethan Walker", city: "Denver" },
  { name: "Natalie Hughes", city: "Charlotte" },
  { name: "Lucas Pereira", city: "Boston" },
  { name: "Ava Thompson", city: "Phoenix" },
  { name: "Noah Campbell", city: "Seattle" },
]

function getNextIndex(currentIndex: number) {
  if (SIGNUP_ACTIVITY.length <= 1) {
    return 0
  }

  const nextIndex = Math.floor(Math.random() * SIGNUP_ACTIVITY.length)
  return nextIndex === currentIndex ? (nextIndex + 1) % SIGNUP_ACTIVITY.length : nextIndex
}

export function SignupActivityToast() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let lastIndex = -1
    let hideTimer: ReturnType<typeof setTimeout> | undefined

    const showActivity = () => {
      const nextIndex = getNextIndex(lastIndex)
      lastIndex = nextIndex
      setActiveIndex(nextIndex)
      setVisible(true)

      if (hideTimer) {
        clearTimeout(hideTimer)
      }

      hideTimer = setTimeout(() => setVisible(false), 9000)
    }

    const firstTimer = setTimeout(showActivity, 2500)
    const interval = setInterval(showActivity, 60000)

    return () => {
      clearTimeout(firstTimer)
      clearInterval(interval)

      if (hideTimer) {
        clearTimeout(hideTimer)
      }
    }
  }, [])

  if (activeIndex === null) {
    return null
  }

  const activity = SIGNUP_ACTIVITY[activeIndex]

  return (
    <div
      aria-live="polite"
      className={`fixed left-4 top-20 z-[70] max-w-[calc(100vw-2rem)] transition duration-500 ease-out sm:left-6 sm:top-24 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-3 opacity-0"
      }`}
    >
      <div className="w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/14 bg-black/85 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.44)] backdrop-blur-xl">
        <div className="flex gap-3">
          <div className="relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black shadow-sm shadow-red-500/20">
            <img src="/brand/cancelit-logo.jpg" alt="" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
              <p className="text-sm font-semibold leading-5">
                CancelIt congratulates {activity.name} for signing up for our service.
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-white/55">
              New signup every minute from {activity.city}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
