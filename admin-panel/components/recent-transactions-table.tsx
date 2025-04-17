"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface Transaction {
  id: number
  type: string
  amount: number
  status: string
  createdAt: string
  sender: string
  recipient: string
}

export function RecentTransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        setIsLoading(true)
        const response = await api.get("/admin/transactions/recent")
        setTransactions(response.data.transactions || [])
      } catch (error) {
        console.error("Failed to fetch recent transactions:", error)
        toast({
          title: "Error",
          description: "Failed to load recent transactions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentTransactions()
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No recent transactions found.</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{transaction.type}</TableCell>
            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.status === "completed"
                    ? "default"
                    : transaction.status === "pending"
                      ? "outline"
                      : "destructive"
                }
              >
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{formatDateTime(transaction.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
