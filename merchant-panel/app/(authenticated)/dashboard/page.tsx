"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { formatCurrency } from "@/lib/utils"

interface DashboardStats {
  balance: number
  totalTransactions: number
  pendingDeposits: number
  pendingWithdrawals: number
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    balance: 0,
    totalTransactions: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // This would be a real API call in production
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant/dashboard`, {
        //   headers: {
        //     Authorization: `Bearer ${token}`
        //   }
        // })
        // const data = await response.json()

        // For demo purposes, we'll use mock data
        setTimeout(() => {
          setStats({
            balance: 5280.75,
            totalTransactions: 128,
            pendingDeposits: 3,
            pendingWithdrawals: 2,
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your merchant account</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
              ) : (
                formatCurrency(stats.balance)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Available for withdrawals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-16 animate-pulse rounded bg-muted"></div> : stats.totalTransactions}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-8 animate-pulse rounded bg-muted"></div> : stats.pendingDeposits}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <div className="h-8 w-8 animate-pulse rounded bg-muted"></div> : stats.pendingWithdrawals}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your most recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted"></div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Transaction history will appear here</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Transactions requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted"></div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Pending actions will appear here</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
