import { Merchant } from "../models/merchant.model"
import { OTP } from "../models/otp.model"
import { generateOTP } from "../utils/generators"
import { HttpException } from "../exceptions/HttpException"
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/email"
import { Op } from "sequelize"

export class MerchantAuthService {
  public async register(merchantData: {
    name: string
    location: string
    contactPerson: string
    contactPhone: string
    email: string
    password: string
    description?: string
  }) {
    // Check if merchant already exists with the same email
    const existingMerchant = await Merchant.findOne({
      where: {
        email: merchantData.email,
      },
    })

    if (existingMerchant) {
      throw new HttpException(409, "Merchant with this email already exists")
    }

    // Create merchant
    const merchant = await Merchant.create(merchantData)

    // Generate and send OTP
    const otpCode = generateOTP()
    await OTP.create({
      userId: null, // No user associated yet
      merchantId: merchant.id,
      phoneNumber: merchantData.contactPhone,
      email: merchantData.email,
      code: otpCode,
      purpose: "merchant_registration",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via Email
    await sendEmail(
      merchantData.email,
      "CUTcoin Merchant Verification",
      `Your CUTcoin merchant verification code is: ${otpCode}. Valid for 10 minutes.`,
    )

    return {
      message: "Registration successful. Please verify your email with the OTP sent.",
      merchantId: merchant.id,
      merchantNumber: merchant.merchantNumber,
    }
  }

  public async verifyOTP(data: { merchantNumber: string; code: string }) {
    const { merchantNumber, code } = data

    // Find merchant
    const merchant = await Merchant.findOne({
      where: { merchantNumber },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Find the OTP
    const otp = await OTP.findOne({
      where: {
        merchantId: merchant.id,
        code,
        purpose: "merchant_registration",
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // Update merchant status
    merchant.status = "approved"
    await merchant.save()

    return { verified: true }
  }

  public async login(credentials: { merchantNumber: string; password: string }) {
    // Find merchant by merchant number
    const merchant = await Merchant.findOne({
      where: { merchantNumber: credentials.merchantNumber },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Validate password
    const isValidPassword = await merchant.validatePassword(credentials.password)
    if (!isValidPassword) {
      throw new HttpException(401, "Invalid credentials")
    }

    // Check if merchant is approved
    if (merchant.status !== "approved") {
      throw new HttpException(403, "Merchant account is not approved. Current status: " + merchant.status)
    }

    // Check if merchant is active
    if (!merchant.isActive) {
      throw new HttpException(403, "Merchant account is inactive")
    }

    // Update last login
    merchant.lastLogin = new Date()
    await merchant.save()

    // Generate JWT token
    const token = this.generateToken(merchant)

    return {
      token,
      merchant: {
        id: merchant.id,
        merchantNumber: merchant.merchantNumber,
        name: merchant.name,
        location: merchant.location,
        contactPerson: merchant.contactPerson,
        contactPhone: merchant.contactPhone,
        email: merchant.email,
        status: merchant.status,
      },
    }
  }

  public async requestPasswordReset(data: { merchantNumber: string; email: string }) {
    // Find merchant
    const merchant = await Merchant.findOne({
      where: {
        merchantNumber: data.merchantNumber,
        email: data.email,
      },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Generate OTP
    const otpCode = generateOTP()
    await OTP.create({
      userId: null,
      merchantId: merchant.id,
      phoneNumber: merchant.contactPhone,
      email: merchant.email,
      code: otpCode,
      purpose: "merchant_password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via Email
    await sendEmail(
      merchant.email,
      "CUTcoin Merchant Password Reset",
      `Your CUTcoin merchant password reset code is: ${otpCode}. Valid for 10 minutes.`,
    )

    return {
      message: "Password reset OTP sent to your registered email",
      merchantId: merchant.id,
    }
  }

  public async resetPassword(data: { merchantNumber: string; code: string; newPassword: string }) {
    const { merchantNumber, code, newPassword } = data

    // Find merchant
    const merchant = await Merchant.findOne({
      where: { merchantNumber },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Find the OTP
    const otp = await OTP.findOne({
      where: {
        merchantId: merchant.id,
        code,
        purpose: "merchant_password_reset",
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // Update password
    merchant.password = newPassword
    await merchant.save()

    return { message: "Password reset successful" }
  }

  private generateToken(merchant: Merchant): string {
    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const expiresIn = process.env.JWT_EXPIRES_IN || "24h"

    return jwt.sign(
      {
        id: merchant.id,
        merchantNumber: merchant.merchantNumber,
        type: "merchant",
      },
      secretKey,
      { expiresIn },
    )
  }
}
