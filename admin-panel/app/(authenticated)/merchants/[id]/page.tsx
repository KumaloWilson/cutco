"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatCurrency } from "@/lib/utils"
import { ArrowLeft, CheckCircle, XCircle, CreditCard } from "lucide-react"
import Link from "next/link"

interface Merchant {
  id: number
  name: string
  location: string
  description: string
  contactPerson: string
  contactPhone: string
  status: string
  isActive: boolean
  createdAt: string
  user: {
    id: number
    studentId: string
    firstName: string
    lastName: string
    phoneNumber: string
    wallet: {
      balance: number
      walletAddress: string
    }
  }
}

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
  sender: {
    studentId: string
    firstName: string
    lastName: string
  }
}

export default function MerchantDetailsPage({ params }: { params: { id: string } }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchMerchantDetails = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/admin/merchants/${params.id}`)
        setMerchant(response.data.merchant)
        setTransactions(response.data.transactions)
      } catch (error) {
        console.error("Error fetching merchant details:", error)
        toast({
          title: "Error",
          description: "Failed to load merchant details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMerchantDetails()
  }, [params.id, toast])

  const updateMerchantStatus = async (data: { status?: string; isActive?: boolean }) => {
    try {
      const response = await api.put(`/admin/merchants/${params.id}/status`, data)
      setMerchant((prevMerchant) => (prevMerchant ? { ...prevMerchant, ...data } : null))
      toast({
        title: "Success",
        description: "Merchant status updated successfully",
      })
    } catch (error) {
      console.error("Error updating merchant status:", error)
      toast({
        title: "Error",
        description: "Failed to update merchant status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading merchant details...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the merchant information.</p>
        </div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Merchant not found</h2>
          <p className="text-muted-foreground">The requested merchant does not exist or has been deleted.</p>
          <Link href="/merchants">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Merchants
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
          <Link href="/merchants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Merchant Details</h1>
        </div>
        <div className="flex gap-2">
          {merchant.status === "pending" && (
            <Button onClick={() => updateMerchantStatus({ status: "approved" })}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Merchant
            </Button>
          )}
          {merchant.isActive ? (
            <Button variant="destructive" onClick={() => updateMerchantStatus({ isActive: false })}>
              <XCircle className="mr-2 h-4 w-4" />
              Suspend Merchant
            </Button>
          ) : (
            <Button onClick={() => updateMerchantStatus({ isActive: true })}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Activate Merchant
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
            <CardDescription>Business details and account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Business Name</p>
                <p className="font-medium">{merchant.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{merchant.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{merchant.description || "No description provided"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{merchant.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">{merchant.contactPhone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                      merchant.status,
                    )}`}
                  >
                    {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      merchant.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {merchant.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registered On</p>
                <p className="font-medium">{formatDate(merchant.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Associated User</CardTitle>
            <CardDescription>User account linked to this merchant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-medium">{merchant.user.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {merchant.user.firstName} {merchant.user.lastName}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{merchant.user.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Address</p>
                <p className="font-medium break-all">{merchant.user.wallet.walletAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(merchant.user.wallet.balance)}</p>
              </div>
              <div className="pt-2">
                <Link href={`/users/${merchant.user.id}`}>
                  <Button variant="outline">View User Profile</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment transactions for this merchant</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.sender.firstName} {transaction.sender.lastName}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{transaction.reference}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-center">
            <Link href={`/transactions?merchantId=${merchant.id}`}>
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                View All Transactions
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
