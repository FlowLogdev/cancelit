"use client"

import { useEffect } from "react"

/**
 * Chrome/Edge sometimes emit
 * "ResizeObserver loop completed with undelivered notifications."
 * when many ResizeObserver callbacks fire in quick succession.
 *
 * The listener below stops that *one* error from bubbling up.
 * All other errors and promise rejections still surface normally.
 */
export function ResizeObserverFix() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (event.message === "ResizeObserver loop completed with undelivered notifications.") {
        event.stopImmediatePropagation()
      }
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      if (
        typeof event.reason === "object" &&
        (event.reason as Error)?.message === "ResizeObserver loop completed with undelivered notifications."
      ) {
        event.preventDefault()
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onRejection)

    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onRejection)
    }
  }, [])

  return null
}
