"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { fetchApi, transactions } from "@/lib/api"
import { PendingTransactionsTable } from "@/components/pending-transactions-table"
import { ArrowDownRight, RefreshCw } from "lucide-react"

export default function DepositsPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [studentId, setStudentId] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const fetchPendingTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await transactions.getPending()
      setPendingTransactions(response.pendingTransactions)
    } catch (error: any) {
      console.error("Failed to fetch pending transactions:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load pending transactions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInitiateDeposit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !amount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await fetchApi("/merchant/cash-deposit", {
        method: "POST",
        body: {
          studentId,
          cashAmount: amountValue,
          notes: "Initiated by merchant",
        },
      })

      toast({
        title: "Deposit initiated",
        description: `Deposit of ${amountValue} for student ${studentId} has been initiated.`,
      })

      // Reset form
      setStudentId("")
      setAmount("")

      // Switch to pending tab and refresh data
      setActiveTab("pending")
      fetchPendingTransactions()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to initiate deposit",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deposits & Withdrawals</h2>
          <p className="text-muted-foreground">Manage cash deposits and withdrawals</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPendingTransactions} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Transactions</TabsTrigger>
          <TabsTrigger value="initiate-deposit">Initiate Deposit</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>Transactions that require your confirmation</CardDescription>
            </CardHeader>
            <CardContent>
              <PendingTransactionsTable
                pendingTransactions={pendingTransactions}
                onRefresh={fetchPendingTransactions}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="initiate-deposit" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Initiate Cash Deposit</CardTitle>
              <CardDescription>Initiate a cash deposit for a student</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInitiateDeposit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <Input
                      id="studentId"
                      placeholder="Enter student ID"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (Cash)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Enter the cash amount received from the student</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <div className="flex items-center">
                    <ArrowDownRight className="h-5 w-5 mr-2 text-primary" />
                    <p className="text-sm font-medium">Important Information</p>
                  </div>
                  <p className="text-sm mt-2">
                    By initiating this deposit, you confirm that you have received the specified amount in cash from the
                    student. The student will need to confirm this transaction.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </>
                  ) : (
                    "Initiate Deposit"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
