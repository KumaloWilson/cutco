"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { fetchApi } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Check, X } from "lucide-react"
import { toast } from "sonner"

interface PendingTransaction {
  id: number
  reference: string
  type: "deposit" | "withdrawal"
  amount: number
  fee: number
  status: string
  description: string
  createdAt: string
  student: {
    studentId: string
    name: string
    phoneNumber: string
  }
}

interface PendingTransactionsTableProps {
  transactions: PendingTransaction[]
  isLoading: boolean
  onRefresh: () => Promise<void>
}

export default function PendingTransactionsTable({
  transactions,
  isLoading,
  onRefresh,
}: PendingTransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)


  const handleConfirm = async () => {
    if (!selectedTransaction) return

    setIsConfirming(true)
    try {
      const endpoint =
        selectedTransaction.type === "deposit"
          ? "/wallet/deposit/merchant-confirm"
          : "/wallet/withdraw/merchant-confirm"

      await fetchApi(endpoint, {
        method: "POST",
        body: { reference: selectedTransaction.reference },
      })

      toast("Transaction confirmed",{
        description: `The ${selectedTransaction.type} has been successfully confirmed.`,
      })

      // Close dialog and refresh data
      setSelectedTransaction(null)
      onRefresh()
    } catch (error) {
      toast("Confirmation failed",{
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading transactions...</div>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 border rounded-lg">
        <div className="text-center">
          <p className="text-muted-foreground">No pending transactions</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <Badge variant={transaction.type === "deposit" ? "default" : "secondary"}>
                    {transaction.type === "deposit" ? (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    )}
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.student.name}</div>
                  <div className="text-xs text-muted-foreground">{transaction.student.studentId}</div>
                </TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                    Confirm
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {selectedTransaction?.type}</DialogTitle>
            <DialogDescription>Please verify the details before confirming this transaction.</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-sm">
                    {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm font-bold">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student</p>
                  <p className="text-sm">{selectedTransaction.student.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                  <p className="text-sm">{selectedTransaction.student.studentId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Reference</p>
                  <p className="text-sm font-mono">{selectedTransaction.reference}</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                {selectedTransaction.type === "deposit" ? (
                  <p className="text-sm">
                    By confirming this deposit, you acknowledge that you have received{" "}
                    {formatCurrency(selectedTransaction.amount)} in cash from the student.
                  </p>
                ) : (
                  <p className="text-sm">
                    By confirming this withdrawal, you acknowledge that you have given{" "}
                    {formatCurrency(selectedTransaction.amount)} in cash to the student.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
