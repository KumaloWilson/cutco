"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Ban, Edit, Wallet } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: number
  fullName: string
  phoneNumber: string
  email: string
  status: string
  createdAt: string
  wallet: {
    id: number
    balance: number
    currency: string
  }
  transactions: Array<{
    id: number
    type: string
    amount: number
    status: string
    createdAt: string
  }>
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/admin/users/${params.id}`)
        setUser(response.data.user)
      } catch (error) {
        console.error("Failed to fetch user details:", error)
        toast({
          title: "Error",
          description: "Failed to load user details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchUserDetails()
    }
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">Loading user details...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="link" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.fullName}</h1>
          <p className="text-muted-foreground">User details and activity</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Personal details and account information</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge
                    variant={
                      user.status === "active" ? "default" : user.status === "inactive" ? "outline" : "destructive"
                    }
                  >
                    {user.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Phone Number</dt>
                <dd>{user.phoneNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Email</dt>
                <dd>{user.email || "N/A"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Joined</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Wallet Balance</dt>
                <dd className="font-semibold text-primary">
                  {formatCurrency(user.wallet.balance)} {user.wallet.currency}
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" className="flex-1">
                <Wallet className="mr-2 h-4 w-4" /> Manage Wallet
              </Button>
              <Button variant="destructive" className="flex-1">
                <Ban className="mr-2 h-4 w-4" /> Suspend
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Recent user activity and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions">
              <TabsList className="mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="logins">Login History</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions">
                {user.transactions && user.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.transactions.map((transaction) => (
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
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">No transactions found.</div>
                )}
              </TabsContent>
              <TabsContent value="logins">
                <div className="py-4 text-center text-muted-foreground">Login history not available.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
