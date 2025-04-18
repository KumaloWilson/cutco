interface ApiOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

export async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem("token")

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.status}`)
  }

  return response.json()
}

export const fetchMerchantDashboardStats = async () => {
  try {
    const response = await fetchApi("/merchant/dashboard/stats")
    return response
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw error
  }
}

export const fetchMerchantRecentTransactions = async (limit = 5) => {
  try {
    const response = await fetchApi(`/merchant/dashboard/transactions/recent?limit=${limit}`)
    return response
  } catch (error) {
    console.error("Error fetching recent transactions:", error)
    throw error
  }
}

export const fetchMerchantTransactionStats = async (period = "week") => {
  try {
    const response = await fetchApi(`/merchant/dashboard/transactions/stats?period=${period}`)
    return response
  } catch (error) {
    console.error("Error fetching transaction stats:", error)
    throw error
  }
}

export const fetchMerchantDepositStats = async (period = "week") => {
  try {
    const response = await fetchApi(`/merchant/dashboard/deposits/stats?period=${period}`)
    return response
  } catch (error) {
    console.error("Error fetching deposit stats:", error)
    throw error
  }
}
