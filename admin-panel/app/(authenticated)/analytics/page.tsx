"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/stats-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Users, CreditCard, DollarSign, TrendingUp } from "lucide-react"

interface AnalyticsData {
  userStats: {
    totalUsers: number
    newUsersThisMonth: number
    userGrowthRate: number
    usersByMonth: Array<{ month: string; count: number }>
  }
  transactionStats: {
    totalTransactions: number
    transactionsThisMonth: number
    transactionGrowthRate: number
    transactionsByMonth: Array<{ month: string; count: number; volume: number }>
  }
  revenueStats: {
    totalRevenue: number
    revenueThisMonth: number
    revenueGrowthRate: number
    revenueByMonth: Array<{ month: string; amount: number }>
  }
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/analytics")
        setAnalyticsData(response.data)
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
        // Set sample data for demonstration
        setAnalyticsData({
          userStats: {
            totalUsers: 1250,
            newUsersThisMonth: 78,
            userGrowthRate: 5.2,
            usersByMonth: [
              { month: "Jan", count: 980 },
              { month: "Feb", count: 1020 },
              { month: "Mar", count: 1080 },
              { month: "Apr", count: 1120 },
              { month: "May", count: 1180 },
              { month: "Jun", count: 1250 },
            ],
          },
          transactionStats: {
            totalTransactions: 8750,
            transactionsThisMonth: 1250,
            transactionGrowthRate: 8.7,
            transactionsByMonth: [
              { month: "Jan", count: 1100, volume: 55000 },
              { month: "Feb", count: 1250, volume: 62500 },
              { month: "Mar", count: 1400, volume: 70000 },
              { month: "Apr", count: 1550, volume: 77500 },
              { month: "May", count: 1700, volume: 85000 },
              { month: "Jun", count: 1750, volume: 87500 },
            ],
          },
          revenueStats: {
            totalRevenue: 28500,
            revenueThisMonth: 4200,
            revenueGrowthRate: 12.5,
            revenueByMonth: [
              { month: "Jan", amount: 3500 },
              { month: "Feb", amount: 3700 },
              { month: "Mar", amount: 3900 },
              { month: "Apr", amount: 4100 },
              { month: "May", amount: 4100 },
              { month: "Jun", amount: 4200 },
            ],
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading analytics data...</span>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">Failed to load analytics data.</p>
        <button className="mt-2 text-primary hover:underline" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights and statistics about your platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(analyticsData.userStats.totalUsers)}
          description={`${analyticsData.userStats.newUsersThisMonth} new this month`}
          icon={<Users className="h-4 w-4" />}
          trend={{
            value: analyticsData.userStats.userGrowthRate,
            isPositive: analyticsData.userStats.userGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Total Transactions"
          value={formatNumber(analyticsData.transactionStats.totalTransactions)}
          description={`${analyticsData.transactionStats.transactionsThisMonth} this month`}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{
            value: analyticsData.transactionStats.transactionGrowthRate,
            isPositive: analyticsData.transactionStats.transactionGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.revenueStats.totalRevenue)}
          description={`${formatCurrency(analyticsData.revenueStats.revenueThisMonth)} this month`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            value: analyticsData.revenueStats.revenueGrowthRate,
            isPositive: analyticsData.revenueStats.revenueGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Growth Rate"
          value={`${analyticsData.userStats.userGrowthRate}%`}
          description="Average user growth rate"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={{
            value: analyticsData.userStats.userGrowthRate,
            isPositive: analyticsData.userStats.userGrowthRate > 0,
          }}
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4 grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.userStats.usersByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume</CardTitle>
              <CardDescription>Monthly transaction count and volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.transactionStats.transactionsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                    <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="count" fill="#2563eb" name="Transactions" />
                    <Bar yAxisId="right" dataKey="volume" fill="#16a34a" name="Volume ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.revenueStats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Bar dataKey="amount" fill="#16a34a" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
