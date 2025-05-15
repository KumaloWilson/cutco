"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { merchantAuth } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface Merchant {
  id: number
  merchantNumber: string
  name: string
  location: string
  contactPerson: string
  contactPhone: string
  email: string
  status: string
}

interface AuthContextType {
  merchant: Merchant | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (merchantNumber: string, password: string) => Promise<void>
  logout: () => void
  register: (merchantData: any) => Promise<{ merchantNumber: string }>
  verifyOtp: (merchantNumber: string, code: string) => Promise<void>
  requestPasswordReset: (merchantNumber: string, email: string) => Promise<void>
  resetPassword: (merchantNumber: string, code: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token")
        const storedMerchant = localStorage.getItem("merchant")

        if (token && storedMerchant) {
          setMerchant(JSON.parse(storedMerchant))
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        // Clear potentially corrupted data
        localStorage.removeItem("token")
        localStorage.removeItem("merchant")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (merchantNumber: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await merchantAuth.login(merchantNumber, password)

      // Save token and merchant data to localStorage
      localStorage.setItem("token", response.token)
      localStorage.setItem("merchant", JSON.stringify(response.merchant))

      // Update state
      setMerchant(response.merchant)

      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.merchant.name}`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login failed:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials. Please try again.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("merchant")

    // Update state
    setMerchant(null)

    // Redirect to login page
    router.push("/login")
  }

  const register = async (merchantData: any) => {
    try {
      setIsLoading(true)
      const response = await merchantAuth.register(merchantData)

      toast({
        title: "Registration successful",
        description: "Please verify your account with the OTP sent to your email.",
      })

      return response
    } catch (error: any) {
      console.error("Registration failed:", error)
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Failed to register. Please try again.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (merchantNumber: string, code: string) => {
    try {
      setIsLoading(true)
      const response = await merchantAuth.verifyOtp(merchantNumber, code)

      toast({
        title: "Verification successful",
        description: "Your account has been verified. You can now log in.",
      })

      return response
    } catch (error: any) {
      console.error("OTP verification failed:", error)
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "Invalid OTP. Please try again.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const requestPasswordReset = async (merchantNumber: string, email: string) => {
    try {
      setIsLoading(true)
      await merchantAuth.requestReset(merchantNumber, email)

      toast({
        title: "Reset request sent",
        description: "If your account exists, you will receive a reset code via email.",
      })
    } catch (error: any) {
      console.error("Password reset request failed:", error)
      // Show generic message to prevent account enumeration
      toast({
        title: "Reset request sent",
        description: "If your account exists, you will receive a reset code via email.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (merchantNumber: string, code: string, newPassword: string) => {
    try {
      setIsLoading(true)
      await merchantAuth.resetPassword(merchantNumber, code, newPassword)

      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      })
    } catch (error: any) {
      console.error("Password reset failed:", error)
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "Failed to reset password. Please try again.",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        merchant,
        isLoading,
        isAuthenticated: !!merchant,
        login,
        logout,
        register,
        verifyOtp,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
