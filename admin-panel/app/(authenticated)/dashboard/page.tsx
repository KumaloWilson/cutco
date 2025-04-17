"use client"

import { useEffect, useState } from "react"
import { Users, CreditCard, DollarSign, Store } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/stats-card"
import { api } from "@/lib/api"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { RecentTransactionsTable } from "@/components/recent-transactions-table"
import { UserActivityChart } from "@/components/user-activity-chart"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalTransactions: 0,
    totalVolume: 0,
    userGrowth: 5.2,
    merchantGrowth: 12.5,
    transactionGrowth: 8.1,
    volumeGrowth: 15.3,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/dashboard")
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your system's performance and key metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          icon={<Users className="h-4 w-4" />}
          trend={{ value: stats.userGrowth, isPositive: stats.userGrowth > 0 }}
        />
        <StatsCard
          title="Total Merchants"
          value={formatNumber(stats.totalMerchants)}
          icon={<Store className="h-4 w-4" />}
          trend={{ value: stats.merchantGrowth, isPositive: stats.merchantGrowth > 0 }}
        />
        <StatsCard
          title="Total Transactions"
          value={formatNumber(stats.totalTransactions)}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: stats.transactionGrowth, isPositive: stats.transactionGrowth > 0 }}
        />
        <StatsCard
          title="Transaction Volume"
          value={formatCurrency(stats.totalVolume)}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: stats.volumeGrowth, isPositive: stats.volumeGrowth > 0 }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>User registrations and activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest transactions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactionsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
