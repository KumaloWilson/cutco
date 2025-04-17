"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

interface Admin {
  id: number
  username: string
  fullName: string
  role: string
  email?: string
}

interface AuthContextType {
  admin: Admin | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("adminToken")
      const storedAdmin = localStorage.getItem("adminData")

      if (storedToken && storedAdmin) {
        setToken(storedToken)
        setAdmin(JSON.parse(storedAdmin))
      }

      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await api.post("/admin/login", { username, password })

      const { token, admin } = response.data

      if (token && admin) {
        localStorage.setItem("adminToken", token)
        localStorage.setItem("adminData", JSON.stringify(admin))

        setToken(token)
        setAdmin(admin)

        toast({
          title: "Login successful",
          description: `Welcome back, ${admin.fullName}`,
        })

        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminData")
    setToken(null)
    setAdmin(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout,
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
