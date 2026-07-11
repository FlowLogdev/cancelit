"use client"

export function logPlaidEvent(eventName: string, metadata?: any, error?: any) {
  fetch("/api/plaid/link-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventName, metadata, error }),
  }).catch((logError) => {
    console.warn("Failed to log Plaid Link event:", logError)
  })
}
