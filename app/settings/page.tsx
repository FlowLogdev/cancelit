"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CancelItLogo } from "@/components/brand/cancelit-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CreditCard,
  User,
  Settings,
  LogOut,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Save,
  XCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  full_name: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface SubscriptionInfo {
  id?: string
  status: string
  plan?: string
  tier?: string
  amount?: number
  current_period_end?: string | number
  billingPortalAvailable?: boolean
}

export default function SettingsPage() {
  const { user, signOut, loading: isLoading } = useAuth()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [cancelEmail, setCancelEmail] = useState("")

  // Profile data
  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      // Load user profile data
      setProfile({
        full_name: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        address: {
          street: user.user_metadata?.address?.street || "",
          city: user.user_metadata?.address?.city || "",
          state: user.user_metadata?.address?.state || "",
          zipCode: user.user_metadata?.address?.zipCode || "",
          country: user.user_metadata?.address?.country || "",
        },
      })

      // Load subscription info
      loadSubscriptionInfo()
    }
  }, [user])

  const loadSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/subscription/info")
      if (response.ok) {
        const data = await response.json()
        setSubscriptionInfo(data.subscription)
      }
    } catch (error) {
      console.error("Error loading subscription:", error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push("/")
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        },
      })

      if (error) {
        setMessage({ type: "error", text: error.message })
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setIsUpdating(false)
    }
  }

  const cancelSubscription = async () => {
    if (cancelEmail !== user?.email) {
      setMessage({ type: "error", text: "Email does not match your account email" })
      return
    }

    setIsCanceling(true)
    setMessage(null)

    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cancelEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Subscription canceled successfully! You will receive a confirmation email.",
        })
        setCancelEmail("")
        loadSubscriptionInfo()
      } else {
        setMessage({ type: "error", text: data.error || "Failed to cancel subscription" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to cancel subscription. Please try again." })
    } finally {
      setIsCanceling(false)
    }
  }

  const updateBillingInfo = async () => {
    if (!subscriptionInfo) {
      router.push("/pricing")
      return
    }

    setIsUpdating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/billing/update-card", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update billing information" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update billing information. Please try again." })
    } finally {
      setIsUpdating(false)
    }
  }

  const currentPlanName = subscriptionInfo?.plan || subscriptionInfo?.tier || "Paid plan"
  const currentPlanAmount =
    typeof subscriptionInfo?.amount === "number" ? `$${subscriptionInfo.amount.toFixed(2)}/month` : "Billing managed securely"
  const renewalDate = (() => {
    if (!subscriptionInfo?.current_period_end) return null

    const rawValue = subscriptionInfo.current_period_end
    const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue)
    const date =
      Number.isFinite(numericValue) && numericValue > 0
        ? new Date(numericValue < 10000000000 ? numericValue * 1000 : numericValue)
        : new Date(rawValue)

    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString()
  })()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <CancelItLogo imageClassName="h-9 w-9" textClassName="text-xl text-gray-900" />

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account information, subscription, and billing.</p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-md flex items-start ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Update your personal information and contact details.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      className="pl-10"
                      disabled
                      placeholder="Email cannot be changed"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email address cannot be changed for security reasons.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    type="text"
                    value={profile.address.street}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value },
                      }))
                    }
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      type="text"
                      value={profile.address.city}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value },
                        }))
                      }
                      placeholder="New York"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      type="text"
                      value={profile.address.state}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value },
                        }))
                      }
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      value={profile.address.zipCode}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: { ...prev.address, zipCode: e.target.value },
                        }))
                      }
                      placeholder="10001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      type="text"
                      value={profile.address.country}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          address: { ...prev.address, country: e.target.value },
                        }))
                      }
                      placeholder="United States"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isUpdating} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? "Updating..." : "Update Account Information"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Subscription Management
              </CardTitle>
              <CardDescription>Manage your subscription and cancel if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscriptionInfo ? (
                <>
                  <div className="bg-black/[0.03] border border-black/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Current Plan</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          subscriptionInfo.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {subscriptionInfo.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{currentPlanName}</p>
                    <p className="text-sm text-gray-600">
                      {currentPlanAmount}
                      {renewalDate ? ` • Renews on ${renewalDate}` : null}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cancelEmail">Confirm your email to cancel subscription</Label>
                      <Input
                        id="cancelEmail"
                        type="email"
                        value={cancelEmail}
                        onChange={(e) => setCancelEmail(e.target.value)}
                        placeholder="Enter your email address"
                      />
                      <p className="text-xs text-gray-500">You will receive a confirmation email after cancellation.</p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isCanceling || !cancelEmail || cancelEmail !== user.email}
                          className="w-full"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {isCanceling ? "Canceling..." : "Cancel Subscription"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel your subscription immediately. You will lose access to all premium features
                            at the end of your current billing period. A confirmation email will be sent to {user.email}
                            .
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={cancelSubscription} className="bg-red-600 hover:bg-red-700">
                            Yes, Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No active subscription found.</p>
                  <Button onClick={() => router.push("/pricing")} className="mt-4">
                    View Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Billing Information
              </CardTitle>
              <CardDescription>
                {subscriptionInfo
                  ? "Update your payment method and billing details."
                  : "Choose a paid plan before adding a payment method."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {subscriptionInfo ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Open the secure billing portal to update the payment method for your active plan.
                    </p>
                    <Button onClick={updateBillingInfo} disabled={isUpdating} className="w-full">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {isUpdating ? "Loading..." : "Update Payment Method"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      There is no payment method on file yet because this account does not have an active paid plan.
                    </p>
                    <Button onClick={() => router.push("/pricing")} className="w-full">
                      View Plans
                    </Button>
                  </>
                )}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• Payment details are handled by the secure checkout provider</p>
                <p>• You can update or remove your card after subscribing</p>
                <p>• All payment transactions are encrypted and PCI compliant</p>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogOut className="mr-2 h-5 w-5" />
                Account Actions
              </CardTitle>
              <CardDescription>Sign out or manage your account session.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
