"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PendingTransactionsTable } from "@/components/pending-transactions-table"
import { transactions, wallet, payments } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, RefreshCw, Plus, History, ArrowDownRight, CreditCard } from "lucide-react"

export default function WalletPage() {
  const [balance, setBalance] = useState("0.00")
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])
  const [recentDeposits, setRecentDeposits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchWalletData()
  }, [filter])

  const fetchWalletData = async () => {
    try {
      setIsLoading(true)

      // Fetch wallet balance
      const balanceResponse = await wallet.getBalance()
      setBalance(balanceResponse.balance)

      // Fetch pending transactions
      const pendingResponse = await transactions.getPending()
      setPendingTransactions(pendingResponse.pendingTransactions)

      // Fetch recent deposits
      const depositsResponse = await payments.getDeposits(1, 3)
      setRecentDeposits(depositsResponse.deposits)
    } catch (error: any) {
      console.error("Failed to fetch wallet data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load wallet data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  const handleRefresh = () => {
    fetchWalletData()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">Manage your merchant wallet and transactions</p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available merchant balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-16 w-48" />
            ) : (
              <div className="flex items-center">
                <Wallet className="h-8 w-8 mr-4 text-primary" />
                <div>
                  <p className="text-4xl font-bold">{formatCurrency(Number.parseFloat(balance))} CUTcoins</p>
                  <p className="text-sm text-muted-foreground">Available for transactions</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button asChild>
              <Link href="/wallet/deposit">
                <Plus className="mr-2 h-4 w-4" />
                Deposit Funds
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wallet/deposits">
                <History className="mr-2 h-4 w-4" />
                Deposit History
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>Transactions awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <PendingTransactionsTable pendingTransactions={pendingTransactions} onRefresh={fetchWalletData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deposits</CardTitle>
            <CardDescription>Your recent CUTcoin deposits</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentDeposits.length === 0 ? (
              <div className="text-center py-6">
                <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm mb-4">No recent deposits</p>
                <Button size="sm" asChild>
                  <Link href="/wallet/deposit">Make a Deposit</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <ArrowDownRight className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Deposit via {deposit.paymentMethod}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(deposit.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(Number.parseFloat(deposit.cutcoinAmount))}</p>
                      <p className="text-xs text-muted-foreground capitalize">{deposit.status}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/wallet/deposits">View All Deposits</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
