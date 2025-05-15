"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { merchantDashboard } from "@/lib/api"
import { TransactionChart } from "@/components/transaction-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownRight, CreditCard, DollarSign, Clock } from "lucide-react"
import PendingTransactionsTable from "@/components/pending-transactions-table"

interface DashboardStats {
  totalTransactions: number
  transactionVolume: number
  pendingTransactions: number
  totalDeposits: number
  currentBalance: string
}

interface Transaction {
  id: number
  userId: number
  merchantId: number
  type: string
  amount: string
  fee: string
  reference: string
  status: string
  description: string
  studentConfirmed: boolean
  merchantConfirmed: boolean
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    studentId: string
    firstName: string
    lastName: string
  }
}

interface TransactionStats {
  dailyStats: Array<{
    date: string
    count: string
    volume: string
  }>
  statusDistribution: Array<{
    status: string
    count: string
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null)
  const [period, setPeriod] = useState("week")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsData, transactionsData, statsChartData] = await Promise.all([
          merchantDashboard.getStats(),
          merchantDashboard.getRecentTransactions(5),
          merchantDashboard.getTransactionStats(period),
        ])

        setStats(statsData)
        setRecentTransactions(transactionsData.transactions)
        setTransactionStats(statsChartData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [period])

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
                <div className="text-2xl font-bold">${Number.parseFloat(stats?.currentBalance || "0").toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Available for withdrawal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Volume</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats?.transactionVolume || 0}</div>
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
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent transactions</CardDescription>
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
              <PendingTransactionsTable transactions={recentTransactions} />
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
