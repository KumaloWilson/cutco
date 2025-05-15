"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { transactions } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface PendingTransaction {
  id: number
  reference: string
  amount: number
  type: string
  description: string
  createdAt: string
  waitingTime: string
  customer: {
    studentId: string
    name: string
  }
  studentConfirmed: boolean
  merchantConfirmed: boolean
}

interface PendingTransactionsTableProps {
  pendingTransactions: PendingTransaction[]
  onRefresh: () => void
}

export function PendingTransactionsTable({ pendingTransactions, onRefresh }: PendingTransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleConfirmTransaction = async () => {
    if (!selectedTransaction) return

    try {
      setIsProcessing(true)

      // Call the appropriate API based on transaction type
      if (selectedTransaction.type === "deposit") {
        await transactions.confirmDeposit(selectedTransaction.reference)
      } else if (selectedTransaction.type === "withdrawal") {
        await transactions.confirmWithdrawal(selectedTransaction.reference)
      }

      toast({
        title: "Transaction Confirmed",
        description: `Transaction ${selectedTransaction.reference} has been confirmed.`,
      })

      // Refresh the transactions list
      onRefresh()
    } catch (error: any) {
      console.error("Failed to confirm transaction:", error)
      toast({
        variant: "destructive",
        title: "Confirmation Failed",
        description: error.message || "Failed to confirm the transaction. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setIsConfirmDialogOpen(false)
      setSelectedTransaction(null)
    }
  }

  const handleRejectTransaction = async () => {
    if (!selectedTransaction) return

    try {
      setIsProcessing(true)
      // Implement rejection logic when API is available
      toast({
        title: "Transaction Rejected",
        description: `Transaction ${selectedTransaction.reference} has been rejected.`,
      })

      // Refresh the transactions list
      onRefresh()
    } catch (error: any) {
      console.error("Failed to reject transaction:", error)
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: error.message || "Failed to reject the transaction. Please try again.",
      })
    } finally {
      setIsProcessing(false)
      setIsRejectDialogOpen(false)
      setSelectedTransaction(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Deposit
          </Badge>
        )
      case "withdrawal":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Withdrawal
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (pendingTransactions.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No pending transactions found</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[350px]">
        <div className="space-y-4">
          {pendingTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{transaction.customer.name}</span>
                  {getTransactionTypeBadge(transaction.type)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {transaction.reference} • {formatDate(transaction.createdAt)}
                </div>
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Waiting: {transaction.waitingTime}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">{formatCurrency(transaction.amount)}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                    onClick={() => {
                      setSelectedTransaction(transaction)
                      setIsConfirmDialogOpen(true)
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setSelectedTransaction(transaction)
                      setIsRejectDialogOpen(true)
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Confirm Transaction Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm this {selectedTransaction?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{selectedTransaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedTransaction.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedTransaction.customer.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{selectedTransaction.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
              </div>

              {selectedTransaction.type === "deposit" && (
                <div className="mt-4 flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    By confirming this deposit, you acknowledge that you have received the cash amount from the student.
                  </p>
                </div>
              )}

              {selectedTransaction.type === "withdrawal" && (
                <div className="mt-4 flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    By confirming this withdrawal, you acknowledge that you have given the cash amount to the student.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransaction}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Processing..." : "Confirm Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Transaction Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this {selectedTransaction?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{selectedTransaction.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student:</span>
                  <span className="font-medium">{selectedTransaction.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedTransaction.customer.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">{formatCurrency(selectedTransaction.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  Rejecting this transaction will cancel it and notify the student.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRejectTransaction} disabled={isProcessing} variant="destructive">
              {isProcessing ? "Processing..." : "Reject Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
