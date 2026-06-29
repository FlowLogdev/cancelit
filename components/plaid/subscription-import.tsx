"use client"

import { useState } from "react"
import type { PlaidItem } from "@/components/plaid/plaid-bank-connection"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, CheckCircle, Download, RefreshCw } from "lucide-react"

interface SubscriptionImportProps {
  plaidItems: PlaidItem[]
}

interface DetectedSubscription {
  id: string
  merchant_name: string
  merchantName: string
  amount: number
  frequency: "weekly" | "monthly" | "yearly"
  last_payment_date: string
  lastCharge: string
  confidence: "high" | "medium" | "low"
  category: string
  transaction_count: number
  selected: boolean
}

export function SubscriptionImport({ plaidItems }: SubscriptionImportProps) {
  const { toast } = useToast()
  const [selectedItemId, setSelectedItemId] = useState(plaidItems[0]?.itemId || "")
  const [isScanning, setIsScanning] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([])
  const [scanSummary, setScanSummary] = useState<{
    detectedCount: number
    returnedCount: number
    transactionCount: number
    planLimit: string
    limitReached: boolean
  } | null>(null)
  const [hasScanned, setHasScanned] = useState(false)

  const selectedItem = plaidItems.find((item) => item.itemId === selectedItemId) || plaidItems[0]

  const handleScanTransactions = async () => {
    const itemId = selectedItem?.itemId

    if (!itemId) {
      toast({
        title: "No account selected",
        description: "Connect a bank account before scanning.",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanProgress(15)
    setHasScanned(false)

    try {
      const response = await fetch("/api/plaid/get-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })

      setScanProgress(75)
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to scan transactions")
      }

      const subscriptions = (data.subscriptions || []).map((subscription: Omit<DetectedSubscription, "selected">) => ({
        ...subscription,
        selected: true,
      }))

      setDetectedSubscriptions(subscriptions)
      setScanSummary({
        detectedCount: data.detected_count || subscriptions.length,
        returnedCount: data.returned_count || subscriptions.length,
        transactionCount: data.transaction_count || 0,
        planLimit: data.plan_limit || "0",
        limitReached: Boolean(data.limit_reached),
      })
      setHasScanned(true)
      setScanProgress(100)

      toast({
        title: "Scan complete",
        description: `Found ${subscriptions.length} potential subscription${subscriptions.length === 1 ? "" : "s"}.`,
      })
    } catch (error) {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleToggleSubscription = (id: string) => {
    setDetectedSubscriptions((prev) =>
      prev.map((subscription) =>
        subscription.id === id ? { ...subscription, selected: !subscription.selected } : subscription,
      ),
    )
  }

  const handleImportSelected = async () => {
    const selectedSubscriptions = detectedSubscriptions.filter((subscription) => subscription.selected)

    if (selectedSubscriptions.length === 0) {
      toast({
        title: "No subscriptions selected",
        description: "Select at least one subscription to import.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const response = await fetch("/api/plaid/import-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptions: selectedSubscriptions }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to import subscriptions")
      }

      toast({
        title: "Import complete",
        description: `Imported ${data.imported_count} subscription${data.imported_count === 1 ? "" : "s"} to your tracker.`,
      })

      setDetectedSubscriptions([])
      setScanSummary(null)
      setHasScanned(false)
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const confidenceBadge = (confidence: DetectedSubscription["confidence"]) => {
    const className =
      confidence === "high"
        ? "bg-emerald-100 text-emerald-800"
        : confidence === "medium"
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800"

    return (
      <Badge className={className}>
        {confidence === "high" ? <CheckCircle className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
        {confidence} confidence
      </Badge>
    )
  }

  const selectedCount = detectedSubscriptions.filter((subscription) => subscription.selected).length
  const selectedMonthlyTotal = detectedSubscriptions
    .filter((subscription) => subscription.selected)
    .reduce((sum, subscription) => sum + subscription.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Subscriptions</CardTitle>
        <CardDescription>Scan connected accounts for recurring charges and choose what to track.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Select value={selectedItem?.itemId} onValueChange={setSelectedItemId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a connected institution" />
            </SelectTrigger>
            <SelectContent>
              {plaidItems.map((item) => (
                <SelectItem key={item.itemId} value={item.itemId}>
                  {item.institutionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleScanTransactions} disabled={isScanning || !selectedItem}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
            Scan Transactions
          </Button>
        </div>

        {!hasScanned && !isScanning && (
          <div className="py-8 text-center">
            <Download className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">Ready to scan</h3>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              CancelIt will analyze recent transactions and return only the number of matches allowed by the customer's
              plan.
            </p>
          </div>
        )}

        {isScanning && (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black" />
            <h3 className="mb-2 text-lg font-medium">Scanning transactions</h3>
            <p className="mb-4 text-sm text-muted-foreground">This may take a moment for large accounts.</p>
            <Progress value={scanProgress} className="mx-auto max-w-sm" />
          </div>
        )}

        {hasScanned && scanSummary && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Scanned {scanSummary.transactionCount} transactions. Found {scanSummary.detectedCount} potential recurring
            charges and returned {scanSummary.returnedCount} for this plan. Plan limit: {scanSummary.planLimit}.
            {scanSummary.limitReached && (
              <span className="ml-1 font-medium text-amber-700">
                Upgrade to return and track more Plaid-detected subscriptions.
              </span>
            )}
          </div>
        )}

        {hasScanned && detectedSubscriptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-medium">Detected Subscriptions</h3>
                <p className="text-sm text-muted-foreground">Review matches before importing them to the dashboard.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <div className="font-medium">
                    {selectedCount} selected - ${selectedMonthlyTotal.toFixed(2)}/month
                  </div>
                </div>
                <Button onClick={handleImportSelected} disabled={selectedCount === 0 || isImporting}>
                  {isImporting ? "Importing..." : "Import Selected"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {detectedSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  role="button"
                  tabIndex={0}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    subscription.selected ? "border-black bg-muted/60" : "border-border hover:bg-muted/40"
                  }`}
                  onClick={() => handleToggleSubscription(subscription.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      handleToggleSubscription(subscription.id)
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={subscription.selected}
                        aria-label={`Select ${subscription.merchantName}`}
                        onClick={(event) => event.stopPropagation()}
                        onCheckedChange={() => handleToggleSubscription(subscription.id)}
                      />
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black text-lg font-bold text-white">
                        {subscription.merchantName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{subscription.merchantName}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>${subscription.amount.toFixed(2)}/month estimate</span>
                          <span>Last charge: {new Date(subscription.lastCharge).toLocaleDateString()}</span>
                          <span>{subscription.transaction_count} matches</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{subscription.category}</Badge>
                          {confidenceBadge(subscription.confidence)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasScanned && detectedSubscriptions.length === 0 && (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <h3 className="mb-2 text-lg font-medium">No recurring charges found</h3>
            <p className="text-sm text-muted-foreground">
              Try another connected account or scan again after more transaction history is available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
