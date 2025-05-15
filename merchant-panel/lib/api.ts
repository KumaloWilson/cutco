const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-cutcoin.onrender.com/api"

// Auth API functions
export const merchantAuth = {
  login: async (merchantNumber: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/merchant-auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchantNumber, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Login failed")
    }

    return response.json()
  },

  register: async (merchantData: {
    name: string
    location: string
    description: string
    contactPerson: string
    contactPhone: string
    email: string
    password: string
  }) => {
    const response = await fetch(`${API_BASE_URL}/merchant-auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(merchantData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Registration failed")
    }

    return response.json()
  },

  verifyOtp: async (merchantNumber: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/merchant-auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchantNumber, code }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "OTP verification failed")
    }

    return response.json()
  },

  requestReset: async (merchantNumber: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/merchant-auth/request-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchantNumber, email }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Password reset request failed")
    }

    return response.json()
  },

  resetPassword: async (merchantNumber: string, code: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/merchant-auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ merchantNumber, code, newPassword }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Password reset failed")
    }

    return response.json()
  },
}

// Protected API calls with authentication
export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Get token from localStorage
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Set up headers with authentication
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      // Handle token expiration
      localStorage.removeItem("token")
      localStorage.removeItem("merchant")
      window.location.href = "/login"
      throw new Error("Session expired. Please login again.")
    }

    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

// Merchant profile API functions
export const merchantProfile = {
  get: async () => {
    return fetchWithAuth<{
      id: number
      userId: number
      merchantNumber: string
      name: string
      location: string
      description: string
      contactPerson: string
      contactPhone: string
      email: string
      status: string
      isActive: boolean
      lastLogin: string
      createdAt: string
      updatedAt: string
      user: {
        studentId: string
        firstName: string
        lastName: string
        phoneNumber: string
      }
    }>("/merchant/profile")
  },

  update: async (data: {
    description?: string
    contactPhone?: string
    email?: string
  }) => {
    return fetchWithAuth<{ success: boolean; message: string }>("/merchant/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Dashboard API functions
export const merchantDashboard = {
  getStats: async () => {
    return fetchWithAuth<{
      totalTransactions: number
      transactionVolume: number
      pendingTransactions: number
      totalDeposits: number
      currentBalance: string
    }>("/merchant/dashboard/stats")
  },

  getRecentTransactions: async (limit = 10) => {
    return fetchWithAuth<{
      transactions: Array<{
        id: number
        userId: number
        merchantId: number
        type: string
        amount: string
        fee: string
        reference: string
        status: string
        description: string
        studentConfirmed: boolean
        merchantConfirmed: boolean
        completedAt: string | null
        cancelledAt: string | null
        createdAt: string
        updatedAt: string
        user: {
          studentId: string
          firstName: string
          lastName: string
        }
      }>
    }>(`/merchant/dashboard/transactions/recent?limit=${limit}`)
  },

  getTransactionStats: async (period = "week") => {
    return fetchWithAuth<{
      dailyStats: Array<{
        date: string
        count: string
        volume: string
      }>
      statusDistribution: Array<{
        status: string
        count: string
      }>
    }>(`/merchant/dashboard/transactions/stats?period=${period}`)
  },
}

// Update the transactions API functions to match the provided endpoints

// Transactions API functions
export const transactions = {
  getAll: async (page = 1, limit = 10, type?: string) => {
    let endpoint = `/merchant/transactions?page=${page}&limit=${limit}`
    if (type && type !== "all") {
      endpoint += `&type=${type}`
    }
    return fetchApi<{
      transactions: Array<{
        id: number
        reference: string
        amount: number
        status: string
        description: string
        type: string
        fee: string
        createdAt: string
        customer: {
          studentId: string
          name: string
        }
      }>
      pagination: {
        total: number
        page: number
        limit: number
        pages: number
      }
    }>(endpoint)
  },

  getPending: async (page = 1, limit = 10) => {
    return fetchApi<{
      pendingTransactions: Array<{
        id: number
        reference: string
        amount: number
        type: string
        description: string
        createdAt: string
        waitingTime: string
        customer: {
          studentId: string
          name: string
        }
        studentConfirmed: boolean
        merchantConfirmed: boolean
      }>
      pagination: {
        total: number
        page: number
        limit: number
        pages: number
      }
    }>(`/merchant/transactions/pending?page=${page}&limit=${limit}`)
  },

  confirmDeposit: async (reference: string) => {
    return fetchApi<{ success: boolean; message: string }>(`/transactions/deposit/merchant-confirm`, {
      method: "POST",
      body: JSON.stringify({ reference }),
    })
  },

  confirmWithdrawal: async (reference: string) => {
    return fetchApi<{ success: boolean; message: string }>(`/merchant/transactions/withdraw/merchant-confirm`, {
      method: "POST",
      body: JSON.stringify({ reference }),
    })
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/merchant/transactions/${id}`)
  },
}

// Wallet API functions
export const wallet = {
  getBalance: async () => {
    return fetchWithAuth<{ balance: string }>("/merchant/wallet/balance")
  },

  getTransactions: async (page = 1, limit = 20) => {
    return fetchWithAuth<{
      transactions: Array<any>
      total: number
      page: number
      limit: number
    }>(`/merchant/wallet/transactions?page=${page}&limit=${limit}`)
  },
}

// Add these new payment-related functions to your existing api.ts file

// Merchant payments API functions
export const merchantPayments = {
  depositFunds: async (amount: number, paymentMethod = "paynow") => {
    return fetchApi<{
      paymentId: number
      reference: string
      amount: number
      cutcoinAmount: number
      redirectUrl: string
      pollUrl: string
      message: string
    }>("/payments/merchant/deposit-funds", {
      method: "POST",
      body: JSON.stringify({
        amount,
        paymentMethod,
      }),
    })
  },

  getDeposits: async (page = 1, limit = 10) => {
    return fetchApi<{
      deposits: Array<{
        id: number
        userId: number
        paymentMethod: string
        amount: string
        cutcoinAmount: string
        reference: string
        externalReference: string | null
        status: string
        metadata: any
        merchantId: number
        createdAt: string
        updatedAt: string
        user: {
          studentId: string
          firstName: string
          lastName: string
          phoneNumber: string
        }
      }>
      pagination: {
        total: number
        page: number
        limit: number
        pages: number
      }
    }>(`/payments/merchant/deposits?page=${page}&limit=${limit}`)
  },

  getDepositById: async (id: number) => {
    return fetchApi<{
      id: number
      userId: number
      paymentMethod: string
      amount: string
      cutcoinAmount: string
      reference: string
      externalReference: string | null
      status: string
      metadata: any
      merchantId: number
      createdAt: string
      updatedAt: string
      user: {
        studentId: string
        firstName: string
        lastName: string
        phoneNumber: string
      }
    }>(`/payments/merchant/deposits/${id}`)
  },

  confirmPayment: async (reference: string, pollUrl: string, status = "paid") => {
    return fetchApi<{
      success: boolean
      message: string
      payment: {
        id: number
        reference: string
        status: string
      }
      transaction: {
        id: number
        senderId: number
        receiverId: number
        amount: string
        type: string
        status: string
        reference: string
        description: string
        fee: string
        updatedAt: string
        createdAt: string
      }
    }>("/payments/webhooks/paynow/return", {
      method: "POST",
      body: JSON.stringify({
        reference,
        pollUrl,
        status,
      }),
    })
  },
}

// Helper function for general API requests
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let message = `Request failed with status ${response.status}`
      try {
        const errorBody = await response.json()
        message = errorBody.message || message
      } catch (parseError) {
        // Ignore parse errors, use the default message
      }
      throw new Error(message)
    }

    return (await response.json()) as T
  } catch (error: any) {
    console.error("API request failed:", error)
    throw error
  }
}
