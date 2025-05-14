"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ArrowLeft, User, CreditCard, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Transaction {
  id: number
  senderId: number
  receiverId: number
  amount: number
  type: string
  status: string
  reference: string
  description: string
  createdAt: string
  fee: number
  sender: {
    id: number
    studentId: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
  receiver: {
    id: number
    studentId: string
    firstName: string
    lastName: string
    phoneNumber: string
  }
}

export default function TransactionDetailsPage() {

  const params = useParams();
  const id = params?.id as string

  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/admin/transactions/${id}`)
        setTransaction(response.data)
      } catch (error) {
        console.error("Error fetching transaction details:", error)
        toast({
          title: "Error",
          description: "Failed to load transaction details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactionDetails()
  }, [id, toast])

  const updateTransactionStatus = async (status: string) => {
    try {
      const response = await api.put(`/admin/transactions/${id}/status`, { status })
      setTransaction((prevTransaction) => (prevTransaction ? { ...prevTransaction, status } : null))
      toast({
        title: "Success",
        description: "Transaction status updated successfully",
      })
    } catch (error) {
      console.error("Error updating transaction status:", error)
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading transaction details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the transaction information.</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Transaction not found</h2>
          <p className="text-muted-foreground">The requested transaction does not exist or has been deleted.</p>
          <Link href="/transactions">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Transactions
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
        </div>
        <div className="flex gap-2">
          {transaction.status === "pending" && (
            <>
              <Button onClick={() => updateTransactionStatus("completed")}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="destructive" onClick={() => updateTransactionStatus("failed")}>
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
          <CardDescription>Details of the transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Type</p>
                <p className="text-xl font-bold">
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-xl font-bold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${
                    transaction.status === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  }`}
                >
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-mono text-sm">{transaction.reference}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fee</p>
                <p className="font-medium">{formatCurrency(transaction.fee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-xl font-bold">{formatCurrency(transaction.amount + transaction.fee)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sender</CardTitle>
            <CardDescription>Information about the sender</CardDescription>
          </CardHeader>
          <CardContent>
            {transaction.sender ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.sender.firstName} {transaction.sender.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Student ID: {transaction.sender.studentId}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{transaction.sender.phoneNumber}</p>
                </div>
                <div className="pt-2">
                  <Link href={`/users/${transaction.sender.id}`}>
                    <Button variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      View User Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">System transaction</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receiver</CardTitle>
            <CardDescription>Information about the receiver</CardDescription>
          </CardHeader>
          <CardContent>
            {transaction.receiver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {transaction.receiver.firstName} {transaction.receiver.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">Student ID: {transaction.receiver.studentId}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{transaction.receiver.phoneNumber}</p>
                </div>
                <div className="pt-2">
                  <Link href={`/users/${transaction.receiver.id}`}>
                    <Button variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      View User Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">System transaction</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline">
          <CreditCard className="mr-2 h-4 w-4" />
          View Related Transactions
        </Button>
      </div>
    </div>
  )
}
