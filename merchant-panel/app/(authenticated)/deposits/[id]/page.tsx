"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { merchantPayments } from "@/lib/api"
import { ArrowLeft, Loader2, ExternalLink, ArrowUpRight } from "lucide-react"

export default function DepositDetailsPage() {
  const [deposit, setDeposit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        setIsLoading(true)
        const depositId = Number(params.id)
        if (isNaN(depositId)) {
          throw new Error("Invalid deposit ID")
        }

        const depositData = await merchantPayments.getDepositById(depositId)
        setDeposit(depositData)
      } catch (error: any) {
        console.error("Failed to fetch deposit details:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load deposit details. Please try again.",
        })
        router.push("/deposits")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeposit()
  }, [params.id, router, toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
        )
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!deposit) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Deposit not found</h3>
        <p className="text-muted-foreground mb-4">
          The deposit you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/deposits">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deposits
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/deposits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deposits
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Deposit Details</h1>
        </div>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Deposit #{deposit.id}</CardTitle>
              {getStatusBadge(deposit.status)}
            </div>
            <CardDescription>Created on {formatDate(deposit.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-mono">{deposit.reference}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payment Method</p>
                <p className="capitalize">{deposit.paymentMethod}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount (USD)</p>
                <p className="text-xl font-bold">${Number(deposit.amount).toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CUTcoins</p>
                <p className="text-xl font-bold">{Number(deposit.cutcoinAmount).toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User Information</p>
              <div className="bg-muted p-4 rounded-md">
                <p>
                  <span className="font-medium">Name:</span> {deposit.user.firstName} {deposit.user.lastName}
                </p>
                <p>
                  <span className="font-medium">Student ID:</span> {deposit.user.studentId}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {deposit.user.phoneNumber}
                </p>
              </div>
            </div>

            {deposit.status === "pending" && deposit.metadata?.redirectUrl && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-400 mb-2">
                  This deposit is pending payment. Click the button below to complete your payment.
                </p>
                <Button asChild>
                  <a href={deposit.metadata.redirectUrl} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Complete Payment on Paynow
                  </a>
                </Button>
              </div>
            )}

            {deposit.status === "completed" && (
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-400">
                  This deposit has been completed and the funds have been added to your wallet.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/deposits">Back to Deposits</Link>
            </Button>
            {deposit.metadata?.pollUrl && (
              <Button variant="ghost" size="sm" asChild>
                <a href={deposit.metadata.pollUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Paynow
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
