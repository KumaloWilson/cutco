"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { payments } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"
import { AlertCircle, CreditCard, DollarSign, Wallet } from "lucide-react"

export default function WalletDepositPage() {
  const [amount, setAmount] = useState("")
  const [cutcoinAmount, setCutcoinAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Calculate CUTcoin amount based on input (1 USD = 100 CUTcoins)
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)

    const numValue = Number.parseFloat(value) || 0
    setCutcoinAmount(numValue * 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const amountValue = Number.parseFloat(amount)

    if (!amountValue || amountValue <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await payments.initiateDeposit(amountValue)

      // Store payment info in session storage for the return page
      sessionStorage.setItem(
        "paymentInfo",
        JSON.stringify({
          reference: response.reference,
          pollUrl: response.pollUrl,
          amount: response.amount,
          cutcoinAmount: response.cutcoinAmount,
        }),
      )

      // Redirect to Paynow
      window.location.href = response.redirectUrl
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Payment initiation failed",
        description: error.message || "Failed to initiate payment. Please try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Deposit Funds</h1>
        <p className="text-muted-foreground">Add funds to your merchant wallet using Paynow</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit via Paynow</CardTitle>
          <CardDescription>
            Enter the amount you want to deposit. You'll be redirected to Paynow to complete the payment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="pl-10"
                    min="0.01"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Minimum deposit: $1.00</p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">You'll receive:</span>
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-bold">{formatCurrency(cutcoinAmount)} CUTcoins</span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Exchange rate:</span>
                  <span className="text-sm">$1 = 100 CUTcoins</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Information</AlertTitle>
                <AlertDescription>
                  You'll be redirected to Paynow to complete your payment. After successful payment, you'll be returned
                  to the merchant dashboard.
                </AlertDescription>
              </Alert>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !amount}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => router.push("/wallet")}>
            Cancel
          </Button>
          <div className="text-xs text-muted-foreground">
            Powered by <span className="font-medium">Paynow</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
