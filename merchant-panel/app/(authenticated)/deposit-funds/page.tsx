"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { merchantPayments } from "@/lib/api"
import { Wallet, CreditCard, ArrowRight, Loader2 } from "lucide-react"

export default function DepositFundsPage() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit",
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await merchantPayments.depositFunds(Number(amount))

      // Redirect to Paynow
      window.location.href = response.redirectUrl
    } catch (error: any) {
      console.error("Deposit initiation failed:", error)
      toast({
        variant: "destructive",
        title: "Deposit Failed",
        description: error.message || "Failed to initiate deposit. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deposit Funds</h1>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Add Funds to Your Account</CardTitle>
            <CardDescription>Deposit funds to your merchant wallet using Paynow</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    min="1"
                    step="0.01"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Minimum deposit amount: $1.00</p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center">
                  <Wallet className="h-5 w-5 mr-2 text-primary" />
                  <p className="text-sm font-medium">Exchange Rate</p>
                </div>
                <p className="text-sm mt-2">1 USD = 100 CUTcoins</p>
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                  <p className="text-sm mt-2 font-medium">
                    You will receive: {(Number(amount) * 100).toLocaleString()} CUTcoins
                  </p>
                )}
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-primary" />
                  <p className="text-sm font-medium">Payment Method</p>
                </div>
                <p className="text-sm mt-2">You will be redirected to Paynow to complete your payment securely.</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Your funds will be available in your wallet once the payment is confirmed.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
