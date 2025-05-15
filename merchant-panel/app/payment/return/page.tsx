"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { merchantPayments } from "@/lib/api"
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react"

export default function PaymentReturnPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const reference = searchParams.get("reference")
    const pollUrl = searchParams.get("pollUrl")

    if (!reference || !pollUrl) {
      setIsLoading(false)
      setError("Missing payment information. Please contact support.")
      return
    }

    const confirmPayment = async () => {
      try {
        setIsLoading(true)
        const response = await merchantPayments.confirmPayment(reference, pollUrl)

        setIsSuccess(true)
        setPaymentDetails(response)

        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        })
      } catch (error: any) {
        console.error("Payment confirmation failed:", error)
        setError(error.message || "Failed to confirm payment. Please contact support.")

        toast({
          variant: "destructive",
          title: "Payment Confirmation Failed",
          description: error.message || "There was an issue confirming your payment.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    confirmPayment()
  }, [searchParams, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader className="text-center">
            {isLoading ? (
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : isSuccess ? (
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            )}

            <CardTitle className="text-2xl">
              {isLoading ? "Processing Payment" : isSuccess ? "Payment Successful" : "Payment Failed"}
            </CardTitle>

            <CardDescription>
              {isLoading
                ? "Please wait while we confirm your payment..."
                : isSuccess
                  ? "Your payment has been processed successfully"
                  : "There was an issue with your payment"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">Verifying your payment with Paynow...</p>
              </div>
            ) : isSuccess && paymentDetails ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-medium">{paymentDetails.payment.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${Number(paymentDetails.transaction.amount) / 100}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CUTcoins:</span>
                    <span className="font-medium">{Number(paymentDetails.transaction.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{paymentDetails.transaction.status}</span>
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Your funds have been added to your wallet and are now available for use.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error || "There was an issue processing your payment. Please try again or contact support."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </Button>
            ) : (
              <Button asChild>
                <Link href="/deposits">
                  {isSuccess ? "View My Deposits" : "Try Again"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
