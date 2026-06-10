"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Shield, Lock, Eye, Key, Smartphone, Download, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { EyeOff } from "lucide-react" // Declare EyeOff variable

export function SecurityPrivacy() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analyticsSharing: false,
    marketingEmails: true,
    thirdPartySharing: false,
    activityTracking: true,
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    sessionTimeout: true,
    deviceTracking: true,
  })

  const [connectedDevices] = useState([
    { id: "1", name: "MacBook Pro", location: "New York, NY", lastActive: "2024-01-15T10:30:00Z", current: true },
    { id: "2", name: "iPhone 15", location: "New York, NY", lastActive: "2024-01-15T09:15:00Z", current: false },
    { id: "3", name: "Chrome Browser", location: "Boston, MA", lastActive: "2024-01-14T16:45:00Z", current: false },
  ])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    try {
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        toast({
          title: "Two-Factor Authentication",
          description: "Please check your email for setup instructions",
        })
      } else {
        toast({
          title: "Two-Factor Authentication Disabled",
          description: "Your account is now less secure",
          variant: "destructive",
        })
      }
      setSecuritySettings({ ...securitySettings, twoFactorAuth: enabled })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication",
        variant: "destructive",
      })
    }
  }

  const handleDeviceRevoke = async (deviceId: string) => {
    try {
      toast({
        title: "Device Access Revoked",
        description: "The device has been signed out",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke device access",
        variant: "destructive",
      })
    }
  }

  const handleDataExport = async () => {
    try {
      toast({
        title: "Data Export Started",
        description: "You'll receive an email when your data is ready for download",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start data export",
        variant: "destructive",
      })
    }
  }

  const handleAccountDeletion = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        toast({
          title: "Account Deletion Initiated",
          description: "Your account will be deleted within 30 days",
          variant: "destructive",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete account",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
            </div>
            <Switch checked={securitySettings.twoFactorAuth} onCheckedChange={handleTwoFactorToggle} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Login Notifications</p>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-600">Update your account password</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowNewPassword(!showNewPassword)}>
              Change
            </Button>
          </div>

          {showNewPassword && (
            <form onSubmit={handlePasswordChange} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit">Update Password</Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Privacy</CardTitle>
          <CardDescription>Control how your data is used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Analytics</p>
              <p className="text-sm text-gray-600">Help us improve with anonymous data</p>
            </div>
            <Switch
              checked={privacySettings.analyticsSharing}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, analyticsSharing: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing Emails</p>
              <p className="text-sm text-gray-600">Receive tips and updates</p>
            </div>
            <Switch
              checked={privacySettings.marketingEmails}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, marketingEmails: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Connected Devices
          </CardTitle>
          <CardDescription>Manage devices that have access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {device.name}
                      {device.current && <Badge variant="secondary">Current</Badge>}
                    </h4>
                    <p className="text-sm text-muted-foreground">{device.location}</p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(device.lastActive).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!device.current && (
                  <Button variant="outline" size="sm" onClick={() => handleDeviceRevoke(device.id)}>
                    Revoke Access
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or delete your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">Download a copy of all your account data</p>
            </div>
            <Button variant="outline" onClick={handleDataExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive" onClick={handleAccountDeletion}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
