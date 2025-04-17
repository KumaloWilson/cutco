"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { fetchApi } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"

interface Transaction {
  id: number
  reference: string
  type: string
  amount: number
  fee: number
  status: string
  description: string
  createdAt: string
  sender?: {
    studentId: string
    name: string
  }
  receiver?: {
    studentId: string
    name: string
  }
}

interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchTransactions = async (page = 1, type?: string) => {
    try {
      setIsLoading(true)

      let endpoint = `/merchant/transactions?page=${page}&limit=${pagination.limit}`
      if (type && type !== "all") {
        endpoint += `&type=${type}`
      }

      const data = await fetchApi<TransactionsResponse>(endpoint)
      setTransactions(data.transactions)
      setPagination(data.pagination)
    } catch (error) {
      toast(
        "Error",{
        description: error instanceof Error ? error.message : "Failed to load transactions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTransactions = async () => {
    setIsRefreshing(true)
    await fetchTransactions(pagination.page, filter !== "all" ? filter : undefined)
    setIsRefreshing(false)
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    fetchTransactions(1, value !== "all" ? value : undefined)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    toast("Search",{
      description: `Searching for: ${searchQuery}`,
    })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      fetchTransactions(newPage, filter !== "all" ? filter : undefined)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Transaction History</h2>
        <Button variant="outline" size="sm" onClick={refreshTransactions} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>View and manage your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search by reference or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" variant="secondary">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            <div className="w-full md:w-48">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="deposit">Deposits</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse">Loading transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex justify-center items-center h-64 border rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "deposit"
                                ? "default"
                                : transaction.type === "withdrawal"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {transaction.type === "deposit" ? (
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                            )}
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {transaction.type === "deposit" ? transaction.sender?.name : transaction.receiver?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.type === "deposit"
                              ? transaction.sender?.studentId
                              : transaction.receiver?.studentId}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                        <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                  ? "secondary"
                                  : transaction.status === "failed"
                                    ? "destructive"
                                    : "outline"
                            }
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {transactions.length} of {pagination.total} transactions
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
