"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMerchantDashboardStats, fetchMerchantRecentTransactions } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { TransactionChart } from "@/components/transaction-chart"
import { PendingTransactionsTable } from "@/components/pending-transactions-table"
import { Wallet, CreditCard, ArrowDownToLine, ArrowUpToLine } from "lucide-react"

interface DashboardStats {
  totalTransactions: number
  transactionVolume: number
  pendingTransactions: number
  totalDeposits: number
  currentBalance: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsData, transactionsData] = await Promise.all([
          fetchMerchantDashboardStats(),
          fetchMerchantRecentTransactions(5),
        ])

        setStats(statsData as DashboardStats)
        setRecentTransactions(transactionsData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Merchant Dashboard</h1>
        <p className="text-muted-foreground">Overview of your merchant account and transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-between p-6">
            <Wallet className="h-8 w-8 text-primary" />
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
              <h3 className="mt-1 text-2xl font-bold">{formatCurrency(stats?.currentBalance || 0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-between p-6">
            <CreditCard className="h-8 w-8 text-primary" />
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <h3 className="mt-1 text-2xl font-bold">{formatNumber(stats?.totalTransactions || 0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-between p-6">
            <ArrowDownToLine className="h-8 w-8 text-primary" />
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Transaction Volume</p>
              <h3 className="mt-1 text-2xl font-bold">{formatCurrency(stats?.transactionVolume || 0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center justify-between p-6">
            <ArrowUpToLine className="h-8 w-8 text-primary" />
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
              <h3 className="mt-1 text-2xl font-bold">{formatCurrency(stats?.totalDeposits || 0)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TransactionChart />

        <Card>
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>You have {stats?.pendingTransactions || 0} pending transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <PendingTransactionsTable limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
