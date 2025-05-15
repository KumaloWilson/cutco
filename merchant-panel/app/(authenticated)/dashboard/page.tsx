"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { merchantDashboard, transactions } from "@/lib/api"
import { TransactionChart } from "@/components/transaction-chart"
import { PendingTransactionsTable } from "@/components/pending-transactions-table"
import { useToast } from "@/components/ui/use-toast"
import { ArrowDownRight, CreditCard, DollarSign, Clock, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  totalTransactions: number
  transactionVolume: number
  pendingTransactions: number
  totalDeposits: number
  currentBalance: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])
  const [transactionStats, setTransactionStats] = useState<any>(null)
  const [period, setPeriod] = useState("week")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch dashboard stats
      const statsData = await merchantDashboard.getStats()
      setStats(statsData)

      // Fetch pending transactions
      const pendingData = await transactions.getPending()
      setPendingTransactions(pendingData.pendingTransactions)

      // Fetch transaction stats for chart
      const statsChartData = await merchantDashboard.getTransactionStats(period)
      setTransactionStats(statsChartData)
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load dashboard data. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboardData()
    setIsRefreshing(false)
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(Number(stats?.currentBalance || 0))}</div>
                <p className="text-xs text-muted-foreground">Available for withdrawal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats?.transactionVolume || 0)}</div>
                <p className="text-xs text-muted-foreground">{stats?.totalTransactions || 0} total transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalDeposits || 0}</div>
                <p className="text-xs text-muted-foreground">Deposits processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.pendingTransactions || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
            <CardDescription>View your transaction volume over time</CardDescription>
            <Tabs defaultValue="week" className="w-full" onValueChange={handlePeriodChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <Skeleton className="w-full h-[300px]" />
              </div>
            ) : (
              <TransactionChart data={transactionStats?.dailyStats || []} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Transactions</CardTitle>
            <CardDescription>Transactions awaiting your confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <PendingTransactionsTable pendingTransactions={pendingTransactions} onRefresh={fetchDashboardData} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  )
}
