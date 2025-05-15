"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function VerifyPage() {
  const [code, setCode] = useState("")
  const [merchantNumber, setMerchantNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const { verifyOtp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get merchant number from URL query params
    const merchantNumberParam = searchParams.get("merchantNumber")
    if (merchantNumberParam) {
      setMerchantNumber(merchantNumberParam)
    }
  }, [searchParams])

  useEffect(() => {
    // Countdown timer for OTP resend
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  }, [countdown, canResend])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!code) {
      setError("Please enter the verification code")
      return
    }

    if (!merchantNumber) {
      setError("Merchant number is missing. Please go back to registration.")
      return
    }

    try {
      setIsLoading(true)
      await verifyOtp(merchantNumber, code)
      setIsVerified(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      setError(error.message || "Verification failed. Please check your code and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    // This would typically call an API to resend the OTP
    setCanResend(false)
    setCountdown(60)
    // Placeholder for actual resend functionality
    alert("A new verification code has been sent to your email.")
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="w-full max-w-md border-primary/10 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verification Successful</CardTitle>
            <CardDescription>Your merchant account has been verified successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">You will be redirected to the login page in a few seconds.</p>
            <p className="text-muted-foreground">
              If you are not redirected automatically, please click the button below.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Verify Your Account</h1>
          <p className="text-muted-foreground mt-2">Enter the verification code sent to your email</p>
        </div>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to your email address. Please enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {merchantNumber && (
                <div className="p-3 rounded-md bg-muted text-sm">
                  <p className="font-medium">Merchant Number:</p>
                  <p className="font-mono">{merchantNumber}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>

              <div className="text-center text-sm">
                {canResend ? (
                  <Button variant="ghost" size="sm" onClick={handleResendCode} className="text-primary">
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Resend verification code
                  </Button>
                ) : (
                  <p className="text-muted-foreground">Resend code in {countdown} seconds</p>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/register">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to registration
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Go to login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
