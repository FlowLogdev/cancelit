"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { logPlaidEvent } from "@/components/plaid/plaid-link-events"

interface PlaidLinkButtonProps {
  onSuccess?: (result?: { itemId?: string; institution?: string }) => void
  onExit?: () => void
  className?: string
  children?: React.ReactNode
}

const LINK_TOKEN_STORAGE_KEY = "cancelit_plaid_link_token"

export function PlaidLinkButton({ onSuccess, onExit, className, children }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [receivedRedirectUri, setReceivedRedirectUri] = useState<string | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    async function createLinkToken() {
      try {
        const isOAuthRedirect =
          typeof window !== "undefined" && new URLSearchParams(window.location.search).has("oauth_state_id")
        const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(LINK_TOKEN_STORAGE_KEY) : null

        if (isOAuthRedirect && storedToken) {
          setReceivedRedirectUri(window.location.href)
          setLinkToken(storedToken)
          return
        }

        window.localStorage.removeItem(LINK_TOKEN_STORAGE_KEY)

        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Failed to create link token")
        }

        const data = await response.json()
        setLinkToken(data.link_token)
        setSetupError(null)
        window.localStorage.setItem(LINK_TOKEN_STORAGE_KEY, data.link_token)
      } catch (error) {
        console.error("Error creating link token:", error)
        const message = error instanceof Error ? error.message : "Failed to initialize Plaid. Please try again."
        setSetupError(message)
        toast({
          title: "Plaid is not ready",
          description: message,
          variant: "destructive",
        })
      }
    }

    createLinkToken()
  }, [toast])

  const handleOnSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      setLoading(true)
      console.log("Plaid Link Success:", { publicToken, metadata })

      try {
        // Exchange public token for access token
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_token: publicToken,
            institution: metadata.institution,
            accounts: metadata.accounts,
          }),
        })

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "Failed to exchange token")
        }

        const data = await response.json()
        window.localStorage.removeItem(LINK_TOKEN_STORAGE_KEY)

        toast({
          title: "Bank Connected Successfully!",
          description: metadata.institution?.name ? `Connected to ${metadata.institution.name}` : "Your account is connected.",
        })

        if (onSuccess) {
          onSuccess({ itemId: data.item_id, institution: data.institution })
        }
      } catch (error) {
        console.error("Error exchanging token:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to connect bank account. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast, onSuccess],
  )

  const handleOnExit = useCallback(
    (error: any, metadata: any) => {
      console.log("Plaid Link Exit:", { error, metadata })
      logPlaidEvent("EXIT", metadata, error)
      window.localStorage.removeItem(LINK_TOKEN_STORAGE_KEY)

      if (error) {
        toast({
          title: "Connection Cancelled",
          description: error.display_message || "Bank connection was not completed.",
          variant: "destructive",
        })
      }

      if (onExit) {
        onExit()
      }
    },
    [toast, onExit],
  )

  const handleOnEvent = useCallback((eventName: string, metadata: any) => {
    logPlaidEvent(eventName, metadata)
  }, [])

  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
    onEvent: handleOnEvent,
    receivedRedirectUri,
  }

  const { open, ready } = usePlaidLink(config)

  const handleClick = () => {
    if (ready) {
      open()
    }
  }

  return (
    <Button onClick={handleClick} disabled={!ready || loading || Boolean(setupError)} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : setupError ? (
        "Plaid setup issue"
      ) : (
        children || "Connect Bank Account"
      )}
    </Button>
  )
}
