"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartData {
  date: string
  users: number
  merchants: number
}

export function UserActivityChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/analytics/user-activity")
        setChartData(response.data.data || [])
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
        toast({
          title: "Error",
          description: "Failed to load chart data. Please try again.",
          variant: "destructive",
        })
        // Use sample data for demonstration
        setChartData([
          { date: "Jan", users: 200, merchants: 30 },
          { date: "Feb", users: 250, merchants: 35 },
          { date: "Mar", users: 300, merchants: 40 },
          { date: "Apr", users: 280, merchants: 45 },
          { date: "May", users: 350, merchants: 50 },
          { date: "Jun", users: 400, merchants: 55 },
          { date: "Jul", users: 450, merchants: 60 },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderRadius: "8px",
              border: "1px solid #6C63FF20",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#6C63FF"
            strokeWidth={2}
            dot={{ fill: "#6C63FF", strokeWidth: 2, r: 4 }}
            activeDot={{ fill: "#6C63FF", strokeWidth: 0, r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="merchants"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={{ fill: "#a78bfa", strokeWidth: 2, r: 4 }}
            activeDot={{ fill: "#a78bfa", strokeWidth: 0, r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
