import crypto from "crypto"

export const generateOTP = (length = 6): string => {
  const digits = "0123456789"
  let otp = ""

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }

  return otp
}

export const generateWalletAddress = (): string => {
  // Generate a random wallet address with CUT prefix
  const randomBytes = crypto.randomBytes(16).toString("hex")
  return `CUT${randomBytes}`
}

export const generateTransactionReference = (): string => {
  // Generate a unique transaction reference
  const timestamp = Date.now().toString()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  return `TXN${timestamp}${random}`
}
