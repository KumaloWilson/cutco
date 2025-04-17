"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ArrowUpRight, ArrowDownRight, Wallet, Users, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import PendingTransactionsTable from "@/components/pending-transactions-table"
import { toast } from "sonner"

interface WalletData {
  balance: number
  walletAddress: string
}

interface PendingTransaction {
  id: number
  reference: string
  type: "deposit" | "withdrawal"
  amount: number
  fee: number
  status: string
  description: string
  createdAt: string
  student: {
    studentId: string
    name: string
    phoneNumber: string
  }
}

export default function DashboardPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Fetch wallet data
      const walletData = await fetchApi<{ walletAddress: string; balance: number }>("/wallet/balance")
      setWallet(walletData)

      // Fetch pending transactions
      const pendingData = await fetchApi<{ pendingTransactions: PendingTransaction[] }>(
        "/wallet/merchant/pending-transactions",
      )
      setPendingTransactions(pendingData.pendingTransactions)
    } catch (error) {
      toast( "Error",{        description: error instanceof Error ? error.message : "Failed to load dashboard data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {user?.merchantName}</h2>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "Loading..." : formatCurrency(wallet?.balance || 0)}</div>
            <p className="text-xs text-muted-foreground">Available for transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : pendingTransactions.filter((t) => t.type === "deposit").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : pendingTransactions.filter((t) => t.type === "withdrawal").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting your confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : formatCurrency(pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Total value of pending transactions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Pending</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <PendingTransactionsTable transactions={pendingTransactions} isLoading={isLoading} onRefresh={refreshData} />
        </TabsContent>
        <TabsContent value="deposits">
          <PendingTransactionsTable
            transactions={pendingTransactions.filter((tx) => tx.type === "deposit")}
            isLoading={isLoading}
            onRefresh={refreshData}
          />
        </TabsContent>
        <TabsContent value="withdrawals">
          <PendingTransactionsTable
            transactions={pendingTransactions.filter((tx) => tx.type === "withdrawal")}
            isLoading={isLoading}
            onRefresh={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
