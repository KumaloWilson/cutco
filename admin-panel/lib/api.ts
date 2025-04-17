import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminData")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
