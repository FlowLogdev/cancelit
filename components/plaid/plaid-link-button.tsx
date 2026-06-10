"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface PlaidLinkButtonProps {
  onSuccess?: () => void
  onExit?: () => void
  className?: string
  children?: React.ReactNode
}

export function PlaidLinkButton({ onSuccess, onExit, className, children }: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Fetch link token on mount
  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch("/api/plaid/create-link-token", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error("Failed to create link token")
        }

        const data = await response.json()
        setLinkToken(data.link_token)
      } catch (error) {
        console.error("Error creating link token:", error)
        toast({
          title: "Error",
          description: "Failed to initialize Plaid. Please try again.",
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
          throw new Error("Failed to exchange token")
        }

        const data = await response.json()
        console.log("Token exchange successful:", data)

        toast({
          title: "Bank Connected Successfully!",
          description: `Connected to ${metadata.institution.name}`,
        })

        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        console.error("Error exchanging token:", error)
        toast({
          title: "Error",
          description: "Failed to connect bank account. Please try again.",
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

  const config = {
    token: linkToken,
    onSuccess: handleOnSuccess,
    onExit: handleOnExit,
  }

  const { open, ready } = usePlaidLink(config)

  const handleClick = () => {
    if (ready) {
      open()
    }
  }

  return (
    <Button onClick={handleClick} disabled={!ready || loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        children || "Connect Bank Account"
      )}
    </Button>
  )
}
