"use client"

import { useState, useCallback } from "react"
import { usePlaidLink } from "react-plaid-link"
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PlaidConnectButtonProps {
  onSuccess?: () => void
}

export function PlaidConnectButton({ onSuccess }: PlaidConnectButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const createLinkToken = async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        throw new Error("Failed to create link token")
      }

      const data = await response.json()
      setLinkToken(data.link_token)
    } catch (error) {
      console.error("Error creating link token:", error)
      toast({
        title: "Connection Error",
        description: "Failed to initialize bank connection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onPlaidSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicToken: public_token }),
        })

        if (!response.ok) {
          throw new Error("Failed to exchange token")
        }

        const data = await response.json()

        toast({
          title: "Bank Connected!",
          description: "Your bank account has been successfully connected.",
        })

        onSuccess?.()
      } catch (error) {
        console.error("Error exchanging token:", error)
        toast({
          title: "Connection Error",
          description: "Failed to complete bank connection. Please try again.",
          variant: "destructive",
        })
      }
    },
    [onSuccess, toast],
  )

  const onPlaidExit = useCallback(
    (err: any, metadata: any) => {
      if (err) {
        console.error("Plaid Link exit error:", err)
        toast({
          title: "Connection Cancelled",
          description: "Bank connection was cancelled.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  })

  const handleConnect = async () => {
    if (!linkToken) {
      await createLinkToken()
    } else {
      open()
    }
  }

  // Auto-open when link token is ready
  if (linkToken && ready && !loading) {
    open()
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || !user}
      className="w-full justify-start bg-transparent"
      variant="outline"
    >
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
      {loading ? "Connecting..." : "Connect Bank Account"}
    </Button>
  )
}
