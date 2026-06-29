"use client"

import { useCallback, useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Building2, CheckCircle, CreditCard, Eye, EyeOff, Plus, RefreshCw, Shield } from "lucide-react"
import { PlaidLinkButton } from "@/components/plaid/plaid-link-button"
import { SubscriptionImport } from "@/components/plaid/subscription-import"

export interface PlaidAccount {
  id: string
  accountId: string
  name: string
  mask: string | null
  type: string | null
  subtype: string | null
}

export interface PlaidItem {
  id: string
  itemId: string
  institutionId: string | null
  institutionName: string
  status: "active" | "error" | string
  errorMessage: string | null
  createdAt: string
  updatedAt: string
  accounts: PlaidAccount[]
}

export default function PlaidBankConnection() {
  const { toast } = useToast()
  const [items, setItems] = useState<PlaidItem[]>([])
  const [showAccountDetails, setShowAccountDetails] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadAccounts = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/plaid/accounts", { cache: "no-store" })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load connected accounts")
      }

      setItems(data.items || [])
    } catch (error) {
      toast({
        title: "Could not load Plaid accounts",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleAccountConnection = () => {
    loadAccounts()
  }

  const statusBadge = (item: PlaidItem) => {
    if (item.status === "active") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      )
    }

    return (
      <Badge className="bg-red-100 text-red-800">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Needs attention
      </Badge>
    )
  }

  const connectedAccountCount = items.reduce((total, item) => total + item.accounts.length, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bank Connections</h2>
        <p className="text-muted-foreground">Connect read-only Plaid accounts and scan for recurring charges.</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          CancelIt never receives bank credentials. Plaid handles the login flow and returns read-only transaction data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>
                {connectedAccountCount > 0
                  ? `${connectedAccountCount} account${connectedAccountCount === 1 ? "" : "s"} connected`
                  : "No bank accounts connected yet"}
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAccountDetails((value) => !value)}>
                {showAccountDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={loadAccounts} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <PlaidLinkButton onSuccess={handleAccountConnection}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Account
              </PlaidLinkButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading connections...
            </div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">Connect your first account</h3>
              <p className="mx-auto mb-4 max-w-md text-sm text-muted-foreground">
                Plaid will open a secure bank login. After connecting, CancelIt can scan recent transactions for recurring
                charges.
              </p>
              <PlaidLinkButton onSuccess={handleAccountConnection}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Account
              </PlaidLinkButton>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.itemId} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-black text-white">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{item.institutionName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Connected {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {item.errorMessage && <p className="mt-3 text-sm text-red-600">{item.errorMessage}</p>}
                    </div>
                    {statusBadge(item)}
                  </div>

                  {showAccountDetails && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {item.accounts.map((account) => (
                        <div key={account.accountId} className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.subtype || account.type || "Account"}
                              {account.mask ? ` ending in ${account.mask}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {items.length > 0 && <SubscriptionImport plaidItems={items} />}
    </div>
  )
}
