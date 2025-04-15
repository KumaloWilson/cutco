import crypto from "crypto"
import { Merchant } from "../models/merchant.model"

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

export const generateMerchantNumber = async (): Promise<string> => {
  // Generate a unique merchant number with MERCH prefix
  // Format: MERCH-XXXXX (where X is a digit)
  let isUnique = false
  let merchantNumber = ""

  while (!isUnique) {
    const random = Math.floor(10000 + Math.random() * 90000).toString() // 5-digit number
    merchantNumber = `MERCH-${random}`

    // Check if this merchant number already exists
    const existingMerchant = await Merchant.findOne({ where: { merchantNumber } })
    if (!existingMerchant) {
      isUnique = true
    }
  }

  return merchantNumber
}
