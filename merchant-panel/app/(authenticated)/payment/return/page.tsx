"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { payments } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function PaymentReturnPage() {
  const [isProcessing, setIsProcessing] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [paymentDetails, setPaymentDetails] = useState<{
    reference: string
    pollUrl: string
    amount: number
    cutcoinAmount: number
  } | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment info from session storage
        const paymentInfoStr = sessionStorage.getItem("paymentInfo")
        if (!paymentInfoStr) {
          throw new Error("Payment information not found")
        }

        const paymentInfo = JSON.parse(paymentInfoStr)
        setPaymentDetails(paymentInfo)

        // Process the payment confirmation
        const result = await payments.confirmPayment(paymentInfo.reference, paymentInfo.pollUrl)

        if (result.success) {
          setIsSuccess(true)
          toast({
            title: "Payment Successful",
            description: `Your wallet has been credited with ${formatCurrency(paymentInfo.cutcoinAmount)} CUTcoins`,
          })

          // Clear the payment info from session storage
          sessionStorage.removeItem("paymentInfo")
        } else {
          throw new Error("Payment verification failed")
        }
      } catch (error: any) {
        console.error("Payment processing error:", error)
        setError(error.message || "Failed to process payment")
        setIsSuccess(false)
        toast({
          variant: "destructive",
          title: "Payment Error",
          description: error.message || "There was a problem processing your payment",
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPayment()
  }, [toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              {isProcessing ? "Processing Payment" : isSuccess ? "Payment Successful" : "Payment Failed"}
            </CardTitle>
            <CardDescription className="text-center">
              {isProcessing
                ? "Please wait while we verify your payment..."
                : isSuccess
                  ? "Your deposit has been processed successfully"
                  : "There was a problem processing your payment"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Verifying payment with Paynow...</p>
              </div>
            ) : isSuccess ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                {paymentDetails && (
                  <div className="rounded-lg bg-muted p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Amount Paid:</span>
                      <span className="font-medium">${paymentDetails.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">CUTcoins Received:</span>
                      <span className="font-medium">{formatCurrency(paymentDetails.cutcoinAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reference:</span>
                      <span className="font-mono text-xs">{paymentDetails.reference}</span>
                    </div>
                  </div>
                )}

                <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900/30">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Payment Successful</AlertTitle>
                  <AlertDescription>
                    Your merchant wallet has been credited with CUTcoins. You can now use them for transactions.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                  </div>
                </div>

                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Payment Failed</AlertTitle>
                  <AlertDescription>
                    {error || "There was a problem processing your payment. Please try again."}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center pt-2">
            <Button
              onClick={() => router.push("/wallet")}
              disabled={isProcessing}
              className={isSuccess ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSuccess ? "Go to Wallet" : "Return to Dashboard"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
