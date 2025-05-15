"\"use client"

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
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Transaction {
  id: number
  userId: number
  merchantId: number
  type: string
  amount: string
  fee: string
  reference: string
  status: string
  description: string
  studentConfirmed: boolean
  merchantConfirmed: boolean
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    studentId: string
    firstName: string
    lastName: string
  }
}

interface PendingTransactionsTableProps {
  transactions: Transaction[]
}

export default function PendingTransactionsTable({ transactions: initialTransactions }: PendingTransactionsTableProps) {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(initialTransactions)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  const handleConfirmTransaction = async () => {
    if (!selectedTransaction) return

    try {
      setIsProcessing(true)
      await transactions.confirm(selectedTransaction.id.toString())

      // Update the local state
      setTransactionsList((prev) =>
        prev.map((tx) =>
          tx.id === selectedTransaction.id ? { ...tx, status: "completed", merchantConfirmed: true } : tx,
        ),
      )

      toast({
        title: "Transaction Confirmed",
        description: `Transaction ${selectedTransaction.reference} has been confirmed.`,
      })
    } catch (error) {
      console.error("Failed to confirm transaction:", error)
      toast({
        variant: "destructive",
        title: "Confirmation Failed",
        description: "Failed to confirm the transaction. Please try again.",
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
      await transactions.cancel(selectedTransaction.id.toString(), "Rejected by merchant")

      // Update the local state
      setTransactionsList((prev) =>
        prev.map((tx) =>
          tx.id === selectedTransaction.id ? { ...tx, status: "cancelled", merchantConfirmed: false } : tx,
        ),
      )

      toast({
        title: "Transaction Rejected",
        description: `Transaction ${selectedTransaction.reference} has been rejected.`,
      })
    } catch (error) {
      console.error("Failed to reject transaction:", error)
      toast({
        variant: "destructive",
        title: "Rejection Failed",
        description: "Failed to reject the transaction. Please try again.",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (transactionsList.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <>
      <ScrollArea className="h-[350px]">
        <div className="space-y-4">
          {transactionsList.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {transaction.user.firstName} {transaction.user.lastName}
                  </span>
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {transaction.reference} • {formatDate(transaction.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg">${Number.parseFloat(transaction.amount).toFixed(2)}</span>
                {transaction.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
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
                      className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setIsRejectDialogOpen(true)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
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
              Are you sure you want to confirm this transaction? This action cannot be undone.
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
                  <span className="font-medium">
                    {selectedTransaction.user.firstName} {selectedTransaction.user.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedTransaction.user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">${Number.parseFloat(selectedTransaction.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
              </div>
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
              Are you sure you want to reject this transaction? This action cannot be undone.
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
                  <span className="font-medium">
                    {selectedTransaction.user.firstName} {selectedTransaction.user.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID:</span>
                  <span className="font-medium">{selectedTransaction.user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">${Number.parseFloat(selectedTransaction.amount).toFixed(2)}</span>
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
