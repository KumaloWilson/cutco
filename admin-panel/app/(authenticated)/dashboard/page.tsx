"use client"

import { useEffect, useState } from "react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/stats-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts"
import { Users, CreditCard, DollarSign, TrendingUp, Store, Wallet } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"

// Analytics data interfaces
interface DashboardStats {
  totalUsers: number
  totalMerchants: number
  transactionVolume: number
  totalTransactions: number
}

interface TransactionStats {
  dailyStats: Array<{
    date: string
    count: number
    volume: number
  }>
  typeDistribution: Array<{
    type: string
    count: number
  }>
}

interface UserStats {
  dailyRegistrations: Array<{
    date: string
    count: number
  }>
  kycDistribution: Array<{
    kycStatus: string
    count: number
  }>
}

interface MerchantStats {
  dailyRegistrations: Array<{
    date: string
    count: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
  }>
  topMerchants: Array<{
    id: string
    name: string
    location: string
    user: {
      id: string
      receivedTransactions: {
        totalAmount: number
      }
    }
  }>
}

interface WalletStats {
  totalBalance: number
  balanceDistribution: Array<{
    range: string
    count: number
  }>
}

// Combined interface for all analytics data
interface AnalyticsData {
  dashboardStats: DashboardStats | null
  transactionStats: TransactionStats | null
  userStats: UserStats | null
  merchantStats: MerchantStats | null
  walletStats: WalletStats | null
}

// Colors for charts
const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#e11d48', '#0891b2', '#4f46e5', '#ca8a04'];

export default function DashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dashboardStats: null,
    transactionStats: null,
    userStats: null,
    merchantStats: null,
    walletStats: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  })
  const { toast } = useToast()

  // Helper function to process daily stats for charts
  const processDailyData = (data: any[], key: string = 'count') => {
    if (!data || !data.length) return []
    
    return data.map(item => ({
      date: format(new Date(item.date), 'MMM dd'),
      [key]: parseInt(item[key] || 0)
    }))
  }

  // Helper function to get monthly data from daily data
  const getMonthlyData = (dailyData: any[], valueKey: string = 'count') => {
    if (!dailyData || !dailyData.length) return []
    
    const monthlyMap = dailyData.reduce((acc, item) => {
      const date = new Date(item.date)
      const month = format(date, 'MMM')
      
      if (!acc[month]) {
        acc[month] = 0
      }
      acc[month] += parseInt(item[valueKey] || 0)
      return acc
    }, {})
    
    return Object.entries(monthlyMap).map(([month, value]) => ({
      month,
      [valueKey]: value
    }))
  }

  // Calculate growth rate between this month and previous month
  const calculateGrowthRate = (monthlyData: any[], key: string = 'count') => {
    if (monthlyData.length < 2) return 0
    
    const currentMonth = monthlyData[monthlyData.length - 1][key]
    const previousMonth = monthlyData[monthlyData.length - 2][key]
    
    if (previousMonth === 0) return 100
    return parseFloat(((currentMonth - previousMonth) / previousMonth * 100).toFixed(1))
  }

  useEffect(() => {
    const fetchAllAnalyticsData = async () => {
      setIsLoading(true)
      try {
        // Fetch all analytics data in parallel
        const [dashboardRes, transactionRes, userRes, merchantRes, walletRes] = await Promise.all([
          api.get("/analytics/dashboard"),
          api.get(`/analytics/transactions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
          api.get(`/analytics/users?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
          api.get(`/analytics/merchants?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
          api.get("/analytics/wallets")
        ])

        setAnalyticsData({
          dashboardStats: dashboardRes.data,
          transactionStats: transactionRes.data,
          userStats: userRes.data,
          merchantStats: merchantRes.data,
          walletStats: walletRes.data
        })
      } catch (error) {
        console.error("Failed to fetch analytics data:", error)
        toast({
          title: "Error",
          description: "Failed to load analytics data. Please try again.",
          variant: "destructive",
        })
        
        // Set sample fallback data
        setAnalyticsData({
          dashboardStats: {
            totalUsers: 1250,
            totalMerchants: 75,
            transactionVolume: 135000,
            totalTransactions: 8750,
          },
          transactionStats: {
            dailyStats: Array.from({ length: 30 }, (_, i) => ({
              date: format(new Date(new Date().setDate(new Date().getDate() - 30 + i)), 'yyyy-MM-dd'),
              count: Math.floor(Math.random() * 50) + 20,
              volume: (Math.floor(Math.random() * 500) + 200) * 10
            })),
            typeDistribution: [
              { type: "payment", count: 5400 },
              { type: "transfer", count: 2300 },
              { type: "deposit", count: 850 },
              { type: "withdrawal", count: 200 }
            ]
          },
          userStats: {
            dailyRegistrations: Array.from({ length: 30 }, (_, i) => ({
              date: format(new Date(new Date().setDate(new Date().getDate() - 30 + i)), 'yyyy-MM-dd'),
              count: Math.floor(Math.random() * 5) + 1
            })),
            kycDistribution: [
              { kycStatus: "verified", count: 850 },
              { kycStatus: "pending", count: 250 },
              { kycStatus: "rejected", count: 75 },
              { kycStatus: "not_started", count: 75 }
            ]
          },
          merchantStats: {
            dailyRegistrations: Array.from({ length: 30 }, (_, i) => ({
              date: format(new Date(new Date().setDate(new Date().getDate() - 30 + i)), 'yyyy-MM-dd'),
              count: i % 3 === 0 ? 1 : 0
            })),
            statusDistribution: [
              { status: "active", count: 60 },
              { status: "pending", count: 10 },
              { status: "suspended", count: 5 }
            ],
            topMerchants: Array.from({ length: 5 }, (_, i) => ({
              id: `m-${i+1}`,
              name: `Merchant ${i+1}`,
              location: `City ${i+1}`,
              user: {
                id: `u-${i+1}`,
                receivedTransactions: {
                  totalAmount: 10000 - (i * 1500)
                }
              }
            }))
          },
          walletStats: {
            totalBalance: 245000,
            balanceDistribution: [
              { range: "0-100", count: 350 },
              { range: "100-500", count: 450 },
              { range: "500-1000", count: 250 },
              { range: "1000-5000", count: 150 },
              { range: "5000+", count: 50 }
            ]
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllAnalyticsData()
  }, [dateRange, toast])

  // Prepare user stats data for charts
  const userRegistrationsDaily = processDailyData(analyticsData.userStats?.dailyRegistrations || [])
  const userRegistrationsMonthly = getMonthlyData(analyticsData.userStats?.dailyRegistrations || [])
  const newUsersThisMonth = userRegistrationsMonthly.length > 0 ? 
    userRegistrationsMonthly[userRegistrationsMonthly.length - 1].count : 0
  const userGrowthRate = calculateGrowthRate(userRegistrationsMonthly)

  // Prepare transaction stats data for charts
  const transactionsDaily = processDailyData(analyticsData.transactionStats?.dailyStats || [])
  const transactionsMonthly = getMonthlyData(analyticsData.transactionStats?.dailyStats || [])
  const transactionVolumeMonthly = getMonthlyData(analyticsData.transactionStats?.dailyStats || [], 'volume')
  const transactionsThisMonth = transactionsMonthly.length > 0 ? 
    transactionsMonthly[transactionsMonthly.length - 1].count : 0
  const transactionGrowthRate = calculateGrowthRate(transactionsMonthly)

  // Prepare revenue data (assuming revenue is transaction volume)
  const revenueMonthly = transactionVolumeMonthly.map(item => ({
    month: item.month,
    amount: item.volume
  }))
  const revenueThisMonth = revenueMonthly.length > 0 ? 
    revenueMonthly[revenueMonthly.length - 1].amount : 0
  const revenueGrowthRate = calculateGrowthRate(revenueMonthly, 'amount')

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

  if (!analyticsData.dashboardStats) {
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
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Detailed insights and statistics about your platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(analyticsData.dashboardStats.totalUsers)}
          description={`${newUsersThisMonth} new this month`}
          icon={<Users className="h-4 w-4" />}
          trend={{
            value: userGrowthRate,
            isPositive: userGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Total Transactions"
          value={formatNumber(analyticsData.dashboardStats.totalTransactions)}
          description={`${transactionsThisMonth} this month`}
          icon={<CreditCard className="h-4 w-4" />}
          trend={{
            value: transactionGrowthRate,
            isPositive: transactionGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analyticsData.dashboardStats.transactionVolume)}
          description={`${formatCurrency((revenueThisMonth || 0) as number)} this month`}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{
            value: revenueGrowthRate,
            isPositive: revenueGrowthRate > 0,
          }}
        />
        <StatsCard
          title="Total Merchants"
          value={formatNumber(analyticsData.dashboardStats.totalMerchants)}
          description="Active business partners"
          icon={<Store className="h-4 w-4" />}
          trend={{
            value: userGrowthRate,
            isPositive: userGrowthRate > 0,
          }}
        />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="mb-4 grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="merchants">Merchants</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Registrations</CardTitle>
                <CardDescription>Daily user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userRegistrationsDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>KYC Status Distribution</CardTitle>
                <CardDescription>Current user verification status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.userStats?.kycDistribution}
                        dataKey="count"
                        nameKey="kycStatus"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ kycStatus, percent }) => `${kycStatus}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.userStats?.kycDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Users']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Volume</CardTitle>
                <CardDescription>Daily transaction count and volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactionsDaily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
            
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
                <CardDescription>Distribution of transaction types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.transactionStats?.typeDistribution}
                        dataKey="count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.transactionStats?.typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Transactions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
              <CardDescription>Monthly revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueMonthly}>
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
        
        {/* Merchants Tab */}
        <TabsContent value="merchants">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Merchant Registrations</CardTitle>
                <CardDescription>Daily merchant sign-ups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processDailyData(analyticsData.merchantStats?.dailyRegistrations || [])}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#9333ea" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Merchant Status</CardTitle>
                <CardDescription>Current merchant status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.merchantStats?.statusDistribution}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.merchantStats?.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Merchants']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Merchants</CardTitle>
                <CardDescription>By transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      layout="vertical" 
                      data={analyticsData.merchantStats?.topMerchants.map(m => ({
                        name: m.name,
                        location: m.location,
                        amount: m.user?.receivedTransactions?.totalAmount || 0
                      })) || []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`$${value}`, "Transaction Volume"]} />
                      <Bar dataKey="amount" fill="#e11d48" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Total Balance</CardTitle>
                <CardDescription>Funds held in all wallets</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-80">
                <div className="text-6xl font-bold text-primary">
                  {formatCurrency(analyticsData.walletStats?.totalBalance || 0)}
                </div>
                <p className="text-muted-foreground mt-4">
                  Current total across {analyticsData.dashboardStats.totalUsers} user wallets
                </p>
                <div className="mt-6 flex items-center">
                  <Wallet className="h-5 w-5 text-primary mr-2" />
                  <span>
                    Average balance: {formatCurrency((analyticsData.walletStats?.totalBalance || 0) / (analyticsData.dashboardStats.totalUsers || 1))}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Balance Distribution</CardTitle>
                <CardDescription>Wallet balance ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.walletStats?.balanceDistribution}
                        dataKey="count"
                        nameKey="range"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.walletStats?.balanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Wallets']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}