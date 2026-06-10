"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  CreditCard,
  Shield,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
} from "lucide-react"
import { PlaidLinkButton } from "@/components/plaid/plaid-link-button"
import { SubscriptionImport } from "@/components/plaid/subscription-import"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ConnectedAccount {
  id: string
  institutionName: string
  accountName: string
  accountType: string
  mask: string
  balance?: number
  lastSync: string
  status: "active" | "error" | "disconnected"
}

interface DetectedSubscription {
  id: string
  merchantName: string
  amount: number
  frequency: string
  lastCharge: string
  confidence: "high" | "medium" | "low"
  category: string
}

export default function PlaidBankConnection() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    {
      id: "1",
      institutionName: "Chase Bank",
      accountName: "Chase Checking",
      accountType: "checking",
      mask: "1234",
      balance: 2450.75,
      lastSync: "2024-01-15T10:30:00Z",
      status: "active",
    },
    {
      id: "2",
      institutionName: "Bank of America",
      accountName: "BofA Credit Card",
      accountType: "credit",
      mask: "5678",
      lastSync: "2024-01-15T09:15:00Z",
      status: "error",
    },
  ])

  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([
    {
      id: "1",
      merchantName: "Netflix",
      amount: 15.99,
      frequency: "monthly",
      lastCharge: "2024-01-10",
      confidence: "high",
      category: "Entertainment",
    },
    {
      id: "2",
      merchantName: "Spotify",
      amount: 9.99,
      frequency: "monthly",
      lastCharge: "2024-01-08",
      confidence: "high",
      category: "Entertainment",
    },
    {
      id: "3",
      merchantName: "Adobe Systems",
      amount: 52.99,
      frequency: "monthly",
      lastCharge: "2024-01-05",
      confidence: "medium",
      category: "Productivity",
    },
  ])

  const [showBalances, setShowBalances] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleAccountConnection = (publicToken: string, metadata: any) => {
    // In a real app, you would exchange the public token for an access token
    toast({
      title: "Account Connected",
      description: `Successfully connected ${metadata.institution.name}`,
    })

    // Add the new account to the list
    const newAccount: ConnectedAccount = {
      id: Date.now().toString(),
      institutionName: metadata.institution.name,
      accountName: metadata.accounts[0].name,
      accountType: metadata.accounts[0].subtype,
      mask: metadata.accounts[0].mask,
      lastSync: new Date().toISOString(),
      status: "active",
    }

    setConnectedAccounts((prev) => [...prev, newAccount])
  }

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      // In a real app, you would call your API to disconnect the account
      setConnectedAccounts((prev) => prev.filter((account) => account.id !== accountId))
      toast({
        title: "Account Disconnected",
        description: "The account has been removed from your connections",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect account",
        variant: "destructive",
      })
    }
  }

  const handleRefreshAccounts = async () => {
    setIsRefreshing(true)
    try {
      // In a real app, you would call your API to refresh account data
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate API call

      setConnectedAccounts((prev) =>
        prev.map((account) => ({
          ...account,
          lastSync: new Date().toISOString(),
          status: "active" as const,
        })),
      )

      toast({
        title: "Accounts Refreshed",
        description: "All account data has been updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh accounts",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = (status: ConnectedAccount["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "disconnected":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConfidenceColor = (confidence: DetectedSubscription["confidence"]) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bank Connections</h2>
        <p className="text-muted-foreground">
          Connect your bank accounts to automatically detect and track subscriptions
        </p>
      </div>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Your banking credentials are never stored. We use bank-level encryption and read-only access through Plaid, a
          trusted financial technology provider used by thousands of apps.
        </AlertDescription>
      </Alert>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Manage your connected bank accounts and credit cards</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)}>
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshAccounts} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <PlaidLinkButton onSuccess={handleAccountConnection}>
                <Plus className="h-4 w-4 mr-2" />
                Connect Account
              </PlaidLinkButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {connectedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Connected Accounts</h3>
              <p className="text-muted-foreground mb-4">
                Connect your bank account to automatically detect subscriptions
              </p>
              <PlaidLinkButton onSuccess={handleAccountConnection}>
                <Plus className="h-4 w-4 mr-2" />
                Connect Your First Account
              </PlaidLinkButton>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {account.accountType === "credit" ? (
                        <CreditCard className="h-6 w-6 text-white" />
                      ) : (
                        <Building2 className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{account.institutionName}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{account.accountName}</span>
                        <span>•</span>
                        <span>****{account.mask}</span>
                        {showBalances && account.balance && (
                          <>
                            <span>•</span>
                            <span>${account.balance.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(account.status)}>
                          {account.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {account.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {account.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Last sync: {new Date(account.lastSync).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDisconnectAccount(account.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detected Subscriptions */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Subscriptions</CardTitle>
            <CardDescription>We found these recurring charges that appear to be subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {detectedSubscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Subscriptions Detected</h3>
                <p className="text-muted-foreground">
                  We'll analyze your transactions and notify you when we find recurring charges
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {detectedSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {subscription.merchantName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{subscription.merchantName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>
                            ${subscription.amount}/{subscription.frequency}
                          </span>
                          <span>•</span>
                          <span>Last charge: {new Date(subscription.lastCharge).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{subscription.category}</Badge>
                          <Badge className={getConfidenceColor(subscription.confidence)}>
                            {subscription.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm">Add to Tracker</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Import Component */}
      {connectedAccounts.length > 0 && <SubscriptionImport connectedAccounts={connectedAccounts} />}
    </div>
  )
}
