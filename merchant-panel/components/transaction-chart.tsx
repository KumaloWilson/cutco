"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMerchantTransactionStats } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  date: string
  count: number
  volume: number
}

interface TransactionStats {
    dailyStats: Array<{
      date: string
      count: string
      volume: string
    }>
  }

export function TransactionChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("week")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchMerchantTransactionStats(period) as TransactionStats

        // Format the data for the chart
        const formattedData = data.dailyStats.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString(),
          count: Number.parseInt(item.count),
          volume: Number.parseFloat(item.volume || 0),
        }))

        setChartData(formattedData)
      } catch (error) {
        console.error("Error fetching transaction stats:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [period, toast])

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Your transaction volume over time</CardDescription>
          </div>
          <Tabs defaultValue="week" value={period} onValueChange={handlePeriodChange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-[200px]">
            {/* Simple bar chart representation */}
            <div className="flex h-full items-end space-x-2">
              {chartData.map((item, index) => {
                const height = item.volume > 0 ? (item.volume / Math.max(...chartData.map((d) => d.volume))) * 100 : 0

                return (
                  <div key={index} className="flex flex-1 flex-col items-center">
                    <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(height, 5)}%` }}></div>
                    <div className="mt-2 text-xs text-muted-foreground">{item.date}</div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total: {chartData.reduce((sum, item) => sum + item.count, 0)} transactions
              </div>
              <div className="text-sm text-muted-foreground">
                Volume: {formatCurrency(chartData.reduce((sum, item) => sum + item.volume, 0))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-muted-foreground">No transaction data available for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
