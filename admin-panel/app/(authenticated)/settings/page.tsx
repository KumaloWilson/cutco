"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    transactionFee: "2.5",
    withdrawalFee: "1.0",
    minWithdrawalAmount: "10",
    maxWithdrawalAmount: "1000",
  })

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuthRequired: true,
    passwordExpiryDays: "90",
    maxLoginAttempts: "5",
    sessionTimeoutMinutes: "30",
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    transactionAlerts: true,
    marketingEmails: false,
  })

  const handleSystemSettingsChange = (field: string, value: string | boolean) => {
    setSystemSettings({
      ...systemSettings,
      [field]: value,
    })
  }

  const handleSecuritySettingsChange = (field: string, value: string | boolean) => {
    setSecuritySettings({
      ...securitySettings,
      [field]: value,
    })
  }

  const handleNotificationSettingsChange = (field: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [field]: value,
    })
  }

  const saveSystemSettings = async () => {
    try {
      setIsLoading(true)
      await api.post("/admin/settings/system", systemSettings)
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save system settings:", error)
      toast({
        title: "Error",
        description: "Failed to save system settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSecuritySettings = async () => {
    try {
      setIsLoading(true)
      await api.post("/admin/settings/security", securitySettings)
      toast({
        title: "Settings saved",
        description: "Security settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save security settings:", error)
      toast({
        title: "Error",
        description: "Failed to save security settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveNotificationSettings = async () => {
    try {
      setIsLoading(true)
      await api.post("/admin/settings/notifications", notificationSettings)
      toast({
        title: "Settings saved",
        description: "Notification settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save notification settings:", error)
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Settings</h1>
        <p className="text-muted-foreground">Manage system settings and configurations.</p>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage general system configurations and parameters.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, the system will be in maintenance mode and users will not be able to access it.
                  </p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleSystemSettingsChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration-enabled">Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register on the platform.</p>
                </div>
                <Switch
                  id="registration-enabled"
                  checked={systemSettings.registrationEnabled}
                  onCheckedChange={(checked) => handleSystemSettingsChange("registrationEnabled", checked)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transaction-fee">Transaction Fee (%)</Label>
                <Input
                  id="transaction-fee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={systemSettings.transactionFee}
                  onChange={(e) => handleSystemSettingsChange("transactionFee", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="withdrawal-fee">Withdrawal Fee (%)</Label>
                <Input
                  id="withdrawal-fee"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={systemSettings.withdrawalFee}
                  onChange={(e) => handleSystemSettingsChange("withdrawalFee", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="min-withdrawal">Minimum Withdrawal Amount</Label>
                <Input
                  id="min-withdrawal"
                  type="number"
                  min="0"
                  value={systemSettings.minWithdrawalAmount}
                  onChange={(e) => handleSystemSettingsChange("minWithdrawalAmount", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max-withdrawal">Maximum Withdrawal Amount</Label>
                <Input
                  id="max-withdrawal"
                  type="number"
                  min="0"
                  value={systemSettings.maxWithdrawalAmount}
                  onChange={(e) => handleSystemSettingsChange("maxWithdrawalAmount", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSystemSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security parameters and policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require two-factor authentication for all users.</p>
                </div>
                <Switch
                  id="two-factor-auth"
                  checked={securitySettings.twoFactorAuthRequired}
                  onCheckedChange={(checked) => handleSecuritySettingsChange("twoFactorAuthRequired", checked)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input
                  id="password-expiry"
                  type="number"
                  min="0"
                  value={securitySettings.passwordExpiryDays}
                  onChange={(e) => handleSecuritySettingsChange("passwordExpiryDays", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                <Input
                  id="max-login-attempts"
                  type="number"
                  min="1"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => handleSecuritySettingsChange("maxLoginAttempts", e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min="1"
                  value={securitySettings.sessionTimeoutMinutes}
                  onChange={(e) => handleSecuritySettingsChange("sessionTimeoutMinutes", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSecuritySettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system-wide notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email notifications for important events.</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send SMS notifications for important events.</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send push notifications to mobile devices.</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("pushNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                  <p className="text-sm text-muted-foreground">Send notifications for all transactions.</p>
                </div>
                <Switch
                  id="transaction-alerts"
                  checked={notificationSettings.transactionAlerts}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("transactionAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Send marketing and promotional emails.</p>
                </div>
                <Switch
                  id="marketing-emails"
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => handleNotificationSettingsChange("marketingEmails", checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
