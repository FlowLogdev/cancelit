"use client"

import { useCallback, useEffect, useState } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const LINK_TOKEN_STORAGE_KEY = "cancelit_plaid_link_token"

export default function PlaidOAuthPage() {
  const { toast } = useToast()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [opened, setOpened] = useState(false)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(LINK_TOKEN_STORAGE_KEY)

    if (!storedToken) {
      setError("Plaid could not resume the bank login. Please return to CancelIt and start the connection again.")
      return
    }

    setLinkToken(storedToken)
  }, [])

  const onSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            institution: metadata.institution,
            accounts: metadata.accounts,
          }),
        })
        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(data?.error || "Failed to finish Plaid connection.")
        }

        window.localStorage.removeItem(LINK_TOKEN_STORAGE_KEY)
        window.location.href = "/dashboard/import?plaid=connected"
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to finish Plaid connection."
        setError(message)
        toast({
          title: "Plaid connection failed",
          description: message,
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const onExit = useCallback((plaidError: any) => {
    if (plaidError) {
      setError(plaidError.display_message || plaidError.error_message || "The bank connection was not completed.")
    } else {
      window.location.href = "/dashboard/import"
    }
  }, [])

  const { open, ready } = usePlaidLink({
    token: linkToken,
    receivedRedirectUri: typeof window !== "undefined" ? window.location.href : undefined,
    onSuccess,
    onExit,
  })

  useEffect(() => {
    if (ready && !opened && linkToken && !error) {
      setOpened(true)
      open()
    }
  }, [error, linkToken, open, opened, ready])

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="mb-3 text-2xl font-semibold">Plaid could not resume</h1>
            <p className="mb-6 text-sm leading-6 text-white/60">{error}</p>
            <Button asChild className="bg-red-500 text-white hover:bg-red-600">
              <a href="/dashboard/import">Back to bank connection</a>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-red-400" />
            <h1 className="mb-3 text-2xl font-semibold">Finishing bank connection</h1>
            <p className="text-sm leading-6 text-white/60">CancelIt is securely resuming Plaid after your bank login.</p>
          </>
        )}
      </div>
    </main>
  )
}
