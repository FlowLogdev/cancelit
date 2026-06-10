"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Download, RefreshCw, AlertTriangle } from "lucide-react"
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

interface SubscriptionImportProps {
  connectedAccounts: ConnectedAccount[]
}

interface DetectedSubscription {
  id: string
  merchantName: string
  amount: number
  frequency: string
  lastCharge: string
  confidence: "high" | "medium" | "low"
  category: string
  selected: boolean
}

export function SubscriptionImport({ connectedAccounts }: SubscriptionImportProps) {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [detectedSubscriptions, setDetectedSubscriptions] = useState<DetectedSubscription[]>([])
  const [hasScanned, setHasScanned] = useState(false)

  // Mock detected subscriptions for demo
  const mockSubscriptions: DetectedSubscription[] = [
    {
      id: "1",
      merchantName: "Netflix",
      amount: 15.99,
      frequency: "monthly",
      lastCharge: "2024-01-10",
      confidence: "high",
      category: "Entertainment",
      selected: true,
    },
    {
      id: "2",
      merchantName: "Spotify",
      amount: 9.99,
      frequency: "monthly",
      lastCharge: "2024-01-08",
      confidence: "high",
      category: "Entertainment",
      selected: true,
    },
    {
      id: "3",
      merchantName: "Adobe Systems",
      amount: 52.99,
      frequency: "monthly",
      lastCharge: "2024-01-05",
      confidence: "medium",
      category: "Productivity",
      selected: false,
    },
    {
      id: "4",
      merchantName: "Amazon Prime",
      amount: 14.99,
      frequency: "monthly",
      lastCharge: "2024-01-12",
      confidence: "high",
      category: "Shopping",
      selected: true,
    },
    {
      id: "5",
      merchantName: "Gym Membership",
      amount: 29.99,
      frequency: "monthly",
      lastCharge: "2024-01-01",
      confidence: "low",
      category: "Fitness",
      selected: false,
    },
  ]

  const handleScanTransactions = async () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsScanning(false)
          setDetectedSubscriptions(mockSubscriptions)
          setHasScanned(true)
          toast({
            title: "Scan Complete",
            description: `Found ${mockSubscriptions.length} potential subscriptions`,
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleToggleSubscription = (id: string) => {
    setDetectedSubscriptions((prev) => prev.map((sub) => (sub.id === id ? { ...sub, selected: !sub.selected } : sub)))
  }

  const handleImportSelected = async () => {
    const selectedSubs = detectedSubscriptions.filter((sub) => sub.selected)

    if (selectedSubs.length === 0) {
      toast({
        title: "No Subscriptions Selected",
        description: "Please select at least one subscription to import",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, you would call your API to import the subscriptions
      toast({
        title: "Import Successful",
        description: `Imported ${selectedSubs.length} subscriptions to your tracker`,
      })

      // Reset the state
      setDetectedSubscriptions([])
      setHasScanned(false)
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import subscriptions. Please try again.",
        variant: "destructive",
      })
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

  const selectedCount = detectedSubscriptions.filter((sub) => sub.selected).length
  const totalValue = detectedSubscriptions.filter((sub) => sub.selected).reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Subscriptions</CardTitle>
        <CardDescription>
          Scan your transaction history to automatically detect recurring subscription charges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasScanned && !isScanning && (
          <div className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Ready to Scan</h3>
            <p className="text-muted-foreground mb-4">
              We'll analyze your transaction history from connected accounts to find recurring charges
            </p>
            <Button onClick={handleScanTransactions} disabled={connectedAccounts.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan for Subscriptions
            </Button>
            {connectedAccounts.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Connect a bank account first to scan for subscriptions
              </p>
            )}
          </div>
        )}

        {isScanning && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Scanning Transactions</h3>
            <p className="text-muted-foreground mb-4">Analyzing your transaction history for recurring charges...</p>
            <Progress value={scanProgress} className="w-full max-w-sm mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">{scanProgress}% complete</p>
          </div>
        )}

        {hasScanned && detectedSubscriptions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Detected Subscriptions</h3>
                <p className="text-sm text-muted-foreground">Review and select subscriptions to import</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {selectedCount} selected • ${totalValue.toFixed(2)}/month
                </div>
                <Button onClick={handleImportSelected} disabled={selectedCount === 0}>
                  Import Selected
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {detectedSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    subscription.selected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleToggleSubscription(subscription.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={subscription.selected}
                          onChange={() => handleToggleSubscription(subscription.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
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
                            {subscription.confidence === "high" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {subscription.confidence === "medium" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {subscription.confidence === "low" && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {subscription.confidence} confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={handleScanTransactions}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Scan Again
              </Button>
            </div>
          </div>
        )}

        {hasScanned && detectedSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No New Subscriptions Found</h3>
            <p className="text-muted-foreground mb-4">
              We didn't find any new recurring charges in your transaction history
            </p>
            <Button variant="outline" onClick={handleScanTransactions}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Scan Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
