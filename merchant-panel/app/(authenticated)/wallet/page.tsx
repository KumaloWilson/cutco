"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PendingTransactionsTable } from "@/components/pending-transactions-table"
import { Wallet, RefreshCw } from "lucide-react"

export default function WalletPage() {
  const [balance, setBalance] = useState("0.00")
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchWalletData()
  }, [filter])

  const fetchWalletData = async () => {
    try {
      setIsLoading(true)
      // This would be replaced with actual API calls
      // const balanceResponse = await wallet.getBalance()
      // const transactionsResponse = await wallet.getTransactions(1, 10, filter)
      // setBalance(balanceResponse.balance)
      // setTransactions(transactionsResponse.transactions)

      // Placeholder data
      setTimeout(() => {
        setBalance("1500.00")
        setTransactions([])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to fetch wallet data:", error)
      setIsLoading(false)
    }
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
  }

  const handleRefresh = () => {
    fetchWalletData()
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
                  <p className="text-4xl font-bold">${balance}</p>
                  <p className="text-sm text-muted-foreground">Available for withdrawals</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Recent wallet transactions</CardDescription>
            <Tabs defaultValue="all" onValueChange={handleFilterChange} className="mt-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <PendingTransactionsTable transactions={transactions} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
