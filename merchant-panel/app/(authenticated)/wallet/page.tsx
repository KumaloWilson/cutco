"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchApi } from "@/lib/api"
import { Copy, RefreshCw, WalletIcon } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface WalletData {
  balance: number
  walletAddress: string
  user: {
    studentId: string
    firstName: string
    lastName: string
  }
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)


  const fetchWallet = async () => {
    try {
      setIsLoading(true)
      const data = await fetchApi<WalletData>("/wallet/balance")
      setWallet(data)
    } catch (error) {
      toast(
        "Error",{
        description: error instanceof Error ? error.message : "Failed to load wallet data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshWallet = async () => {
    setIsRefreshing(true)
    await fetchWallet()
    setIsRefreshing(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast("Copied to clipboard",{
      description: "Wallet address has been copied to clipboard",
    })
  }

  useEffect(() => {
    fetchWallet()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Merchant Wallet</h2>
        <Button variant="outline" size="sm" onClick={refreshWallet} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="bg-primary p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-primary-foreground">Current Balance</h3>
                <p className="text-3xl font-bold text-primary-foreground mt-2">
                  {isLoading ? "Loading..." : formatCurrency(wallet?.balance || 0)}
                </p>
              </div>
              <WalletIcon className="h-12 w-12 text-primary-foreground opacity-80" />
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Wallet Address</h4>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <code className="text-xs sm:text-sm font-mono truncate">
                    {isLoading ? "Loading..." : wallet?.walletAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => wallet?.walletAddress && copyToClipboard(wallet.walletAddress)}
                    disabled={isLoading}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Merchant ID</h4>
                <p className="text-sm">{isLoading ? "Loading..." : wallet?.user.studentId}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Merchant Name</h4>
                <p className="text-sm">
                  {isLoading ? "Loading..." : `${wallet?.user.firstName} ${wallet?.user.lastName}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Information</CardTitle>
            <CardDescription>Important information about your merchant wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Deposits</h4>
              <p className="text-sm text-muted-foreground">
                When a student initiates a deposit, you'll receive a notification. Confirm the deposit after receiving
                cash from the student.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Withdrawals</h4>
              <p className="text-sm text-muted-foreground">
                When a student initiates a withdrawal, provide the cash to the student and then confirm the transaction.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Fees</h4>
              <p className="text-sm text-muted-foreground">
                You earn a small commission on each transaction processed through your merchant account.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
