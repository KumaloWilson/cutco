import { User } from "../models/user.model"
import { OTP } from "../models/otp.model"
import { Wallet } from "../models/wallet.model"
import { generateOTP, generateWalletAddress } from "../utils/generators"
import { sendSMS } from "../utils/sms"
import jwt from "jsonwebtoken"
import { HttpException } from "../exceptions/HttpException"
import type { Transaction } from "sequelize"
import sequelize from "../config/sequelize"
import { Op } from "sequelize" // Import the Sequelize operators

export class AuthService {
  public async register(userData: {
    studentId: string
    phoneNumber: string
    pin: string
    firstName: string
    lastName: string
  }) {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ studentId: userData.studentId }, { phoneNumber: userData.phoneNumber }],
      },
    })

    if (existingUser) {
      throw new HttpException(409, "User already exists")
    }

    // Create user and wallet in a transaction
    const result = await sequelize.transaction(async (t: Transaction) => {
      // Create user
      const user = await User.create(userData, { transaction: t })

      // Create wallet for user
      const walletAddress = generateWalletAddress()
      await Wallet.create(
        {
          userId: user.id,
          walletAddress,
          balance: 0,
        },
        { transaction: t },
      )

      // Generate and send OTP
      const otpCode = generateOTP()
      await OTP.create(
        {
          userId: user.id,
          phoneNumber: userData.phoneNumber,
          code: otpCode,
          purpose: "registration",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
        { transaction: t },
      )

      // Send OTP via SMS
      await sendSMS(
        userData.phoneNumber,
        `Your CUTcoin verification code is: ${otpCode}. Valid for 10 minutes.`
      )

      return user
    })

    return {
      message: "Registration successful. Please verify your phone number with the OTP sent.",
      userId: result.id,
    }
  }

  public async verifyOTP(data: { phoneNumber: string; code: string; purpose: string }) {
    const { phoneNumber, code, purpose } = data

    // Find the OTP
    const otp = await OTP.findOne({
      where: {
        phoneNumber,
        code,
        purpose,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }, // Fix the $gt operator
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // If registration OTP, update user KYC status
    if (purpose === "registration") {
      const user = await User.findByPk(otp.userId)
      if (user) {
        user.kycStatus = "verified"
        await user.save()
      }
    }

    return { verified: true }
  }

  public async login(credentials: { studentId: string; pin: string }) {
    // Find user by student ID
    const user = await User.findOne({
      where: { studentId: credentials.studentId },
    })

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Validate PIN
    const isValidPin = await user.validatePin(credentials.pin)
    if (!isValidPin) {
      throw new HttpException(401, "Invalid credentials")
    }

    // Check if KYC is verified
    if (user.kycStatus !== "verified") {
      throw new HttpException(403, "Account not verified. Please complete KYC process.")
    }

    // Generate OTP for login
    const otpCode = generateOTP()
    await OTP.create({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      code: otpCode,
      purpose: "login",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    await sendSMS(
      user.phoneNumber,
      `Your CUTcoin login code is: ${otpCode}. Valid for 10 minutes.`
    )
    return {
      message: "OTP sent to your registered phone number",
      userId: user.id,
    }
  }

  public async verifyLoginOTP(data: { studentId: string; code: string }) {
    const { studentId, code } = data

    // Find user
    const user = await User.findOne({
      where: { studentId },
    })

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Find the OTP
    const otp = await OTP.findOne({
      where: {
        userId: user.id,
        code,
        purpose: "login",
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }, // Fix the $gt operator
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      token,
      user: {
        id: user.id,
        studentId: user.studentId,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        kycStatus: user.kycStatus,
      },
    }
  }

  public async requestPasswordReset(data: { studentId: string; phoneNumber: string }) {
    // Find user
    const user = await User.findOne({
      where: {
        studentId: data.studentId,
        phoneNumber: data.phoneNumber,
      },
    })

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Generate OTP
    const otpCode = generateOTP()
    await OTP.create({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      code: otpCode,
      purpose: "password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    await sendSMS(
      user.phoneNumber,
      `Your CUTcoin PIN reset code is: ${otpCode}. Valid for 10 minutes.`
    )
    return {
      message: "OTP sent to your registered phone number",
      userId: user.id,
    }
  }

  public async resetPin(data: { studentId: string; code: string; newPin: string }) {
    const { studentId, code, newPin } = data

    // Find user
    const user = await User.findOne({
      where: { studentId },
    })

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Find the OTP
    const otp = await OTP.findOne({
      where: {
        userId: user.id,
        code,
        purpose: "password_reset",
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }, // Fix the $gt operator
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // Update PIN
    user.pin = newPin
    await user.save()

    return { message: "PIN reset successful" }
  }

  public async completeKYC(userId: number, kycData: any) {
    const user = await User.findByPk(userId)

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Update KYC data
    user.kycData = kycData
    user.kycStatus = "pending"
    await user.save()

    return {
      message: "KYC information submitted successfully. Pending verification.",
      kycStatus: user.kycStatus,
    }
  }

  private generateToken(user: User): string {
    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const expiresIn = "24h"

    return jwt.sign(
      {
        id: user.id,
        studentId: user.studentId,
      },
      secretKey,
      { expiresIn },
    )
  }
}