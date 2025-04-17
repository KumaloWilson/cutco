"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface User {
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
  user: User | null
  token: string | null
  isLoading: boolean
  login: (merchantNumber: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    // Only run on client side
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        setToken(storedToken)
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Failed to parse user data", e)
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      }

      setIsLoading(false)
    }
  }, [])

  const login = async (merchantNumber: string, password: string) => {
    setIsLoading(true)
    try {
      // Call the login API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/merchant-auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merchantNumber, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }

      const data = await response.json()

      // Save token and user data
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.merchant))

      setToken(data.token)
      setUser(data.merchant)

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.merchant.name}!`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}