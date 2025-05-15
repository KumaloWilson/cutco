"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface ChartData {
  date: string
  count: string
  volume: string
}

interface TransactionChartProps {
  data: ChartData[]
}

export function TransactionChart({ data }: TransactionChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Process the data for the chart
    const processedData = data.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Volume: Number.parseFloat(item.volume),
      Count: Number.parseInt(item.count),
    }))

    setChartData(processedData)
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            return name === "Volume" ? [`$${value}`, name] : [value, name]
          }}
        />
        <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
        <Bar dataKey="Volume" fill="#6C63FF" radius={[4, 4, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}
