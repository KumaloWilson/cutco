import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { Payment } from "../models/payment.model"
import { MerchantDeposit } from "../models/merchant-deposit.model"
import { Transaction } from "../models/transaction.model"
import { Merchant } from "../models/merchant.model"
import { SystemConfig } from "../models/system-config.model"
import { HttpException } from "../exceptions/HttpException"
import { PaynowService } from "./paynow.service"
import { NotificationService } from "./notification.service"
import { generateTransactionReference } from "../utils/generators"

import sequelize from "@/config/sequelize"
import type { Transaction as SequelizeTransaction } from "sequelize"
import { Op } from "sequelize"

export class PaymentService {
  private paynowService = new PaynowService()
  private notificationService = new NotificationService()

  // Get exchange rate from system config
  private async getExchangeRate(): Promise<number> {
    const config = await SystemConfig.findOne({
      where: { key: "exchange_rate", isActive: true },
    })

    if (!config) {
      return 100 // Default: 1 USD = 100 CUTcoins
    }

    return Number.parseFloat(config.value)
  }

  // Calculate CUTcoin amount based on fiat amount
  private async calculateCutcoinAmount(fiatAmount: number): Promise<number> {
    const exchangeRate = await this.getExchangeRate()
    return fiatAmount * exchangeRate
  }

  // Initiate Paynow payment
  public async initiatePaynowPayment(userId: number, amount: number) {
    // Validate amount
    if (amount <= 0) {
      throw new HttpException(400, "Amount must be greater than zero")
    }

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Calculate CUTcoin amount
    const cutcoinAmount = await this.calculateCutcoinAmount(amount)

    // Generate reference
    const reference = generateTransactionReference()

    // Create payment record
    const payment = await Payment.create({
      userId,
      paymentMethod: "paynow",
      amount,
      cutcoinAmount,
      reference,
      status: "pending",
      metadata: {},
    })

    // Initialize Paynow payment
    const paymentResult = await this.paynowService.createPayment(
      reference,
      user.email || `${user.studentId}@cutcoin.ac.zw`, // Fallback email
      amount,
      `CUTcoin purchase: ${cutcoinAmount} CUTcoins`,
    )

    if (!paymentResult.success) {
      // Update payment status to failed
      await payment.update({
        status: "failed",
        metadata: { error: paymentResult.error },
      })

      throw new HttpException(500, paymentResult.error || "Payment initialization failed")
    }

    // Update payment with Paynow details
    await payment.update({
      metadata: {
        pollUrl: paymentResult.pollUrl,
        redirectUrl: paymentResult.redirectUrl,
      },
    })

    return {
      paymentId: payment.id,
      reference: payment.reference,
      amount,
      cutcoinAmount,
      redirectUrl: paymentResult.redirectUrl,
    }
  }

  // Verify Paynow payment
  public async verifyPaynowPayment(reference: string) {
    // Find payment
    const payment = await Payment.findOne({
      where: { reference, paymentMethod: "paynow" },
    })

    if (!payment) {
      throw new HttpException(404, "Payment not found")
    }

    if (payment.status === "completed") {
      return {
        success: true,
        message: "Payment already processed",
        payment,
      }
    }

    // Get poll URL from metadata
    const pollUrl = payment.metadata?.pollUrl
    if (!pollUrl) {
      throw new HttpException(400, "Invalid payment data")
    }

    // Check payment status
    const statusResult = await this.paynowService.checkPaymentStatus(pollUrl)

    if (!statusResult.paid) {
      return {
        success: false,
        message: `Payment not completed. Status: ${statusResult.status}`,
        payment,
      }
    }

    // Process the payment
    const result = await this.processPayment(payment.id)

    return {
      success: true,
      message: "Payment processed successfully",
      transaction: result.transaction,
    }
  }

  // Process completed payment
  private async processPayment(paymentId: number) {
    // Find payment
    const payment = await Payment.findByPk(paymentId, {
      include: [{ model: User }],
    })

    if (!payment) {
      throw new HttpException(404, "Payment not found")
    }

    if (payment.status === "completed") {
      throw new HttpException(400, "Payment already processed")
    }

    // Process in transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Find user wallet
      const wallet = await Wallet.findOne({
        where: { userId: payment.userId },
        transaction: t,
      })

      if (!wallet) {
        throw new HttpException(404, "Wallet not found")
      }

      // Update wallet balance
      wallet.balance = Number(wallet.balance) + Number(payment.cutcoinAmount)
      await wallet.save({ transaction: t })

      // Create transaction record
      const transaction = await Transaction.create(
        {
          senderId: payment.userId, // Self-deposit
          receiverId: payment.userId,
          amount: payment.cutcoinAmount,
          type: "deposit",
          status: "completed",
          reference: payment.reference,
          description: `Deposit via ${payment.paymentMethod}`,
          fee: 0,
        },
        { transaction: t },
      )

      // Update payment status
      payment.status = "completed"
      await payment.save({ transaction: t })

      return { wallet, transaction, payment }
    })

    // Send notification
    await this.notificationService.sendSMS({
      userId: payment.userId,
      message: `Your deposit of ${payment.cutcoinAmount} CUTcoins has been processed. New balance: ${result.wallet.balance} CUTcoins.`,
    })

    return result
  }

  // Merchant initiates cash deposit for student
  public async initiateCashDeposit(
    merchantId: number,
    data: {
      studentId: string
      cashAmount: number
      notes?: string
    },
  ) {
    const { studentId, cashAmount, notes } = data

    // Validate amount
    if (cashAmount <= 0) {
      throw new HttpException(400, "Amount must be greater than zero")
    }

    // Find merchant
    const merchant = await Merchant.findByPk(merchantId)
    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Check if merchant is approved
    if (merchant.status !== "approved") {
      throw new HttpException(403, "Merchant is not approved to accept deposits")
    }

    // Find student
    const student = await User.findOne({
      where: { studentId },
    })

    if (!student) {
      throw new HttpException(404, "Student not found")
    }

    // Calculate CUTcoin amount
    const cutcoinAmount = await this.calculateCutcoinAmount(cashAmount)

    // Generate reference
    const reference = generateTransactionReference()

    // Create merchant deposit record
    const deposit = await MerchantDeposit.create({
      merchantId,
      studentId: student.id,
      cashAmount,
      cutcoinAmount,
      reference,
      status: "pending",
      notes: notes || "",
    })

    // Create payment record
    await Payment.create({
      userId: student.id,
      paymentMethod: "cash",
      amount: cashAmount,
      cutcoinAmount,
      reference,
      status: "pending",
      merchantId: merchant.id,
      metadata: {
        merchantDepositId: deposit.id,
      },
    })

    // Send notification to student
    await this.notificationService.sendSMS({
      userId: student.id,
      message: `A cash deposit of ${cashAmount} (${cutcoinAmount} CUTcoins) has been initiated by merchant ${merchant.name}. Reference: ${reference}`,
    })

    return {
      depositId: deposit.id,
      reference,
      studentId: student.studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      cashAmount,
      cutcoinAmount,
      status: deposit.status,
    }
  }

  // Student confirms cash deposit
  public async confirmCashDeposit(studentId: number, reference: string) {
    // Find deposit
    const deposit = await MerchantDeposit.findOne({
      where: { reference, studentId },
      include: [{ model: Merchant }],
    })

    if (!deposit) {
      throw new HttpException(404, "Deposit not found")
    }

    if (deposit.status !== "pending") {
      throw new HttpException(400, `Deposit already ${deposit.status}`)
    }

    // Update deposit status
    deposit.status = "approved"
    await deposit.save()

    // Find payment
    const payment = await Payment.findOne({
      where: { reference, userId: studentId },
    })

    if (!payment) {
      throw new HttpException(404, "Payment record not found")
    }

    // Process the payment
    const result = await this.processPayment(payment.id)

    // Send notification to merchant
    await this.notificationService.sendSMS({
      userId: deposit.merchant.userId,
      message: `Cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) has been confirmed by student. Reference: ${reference}`,
    })

    return {
      success: true,
      message: "Cash deposit confirmed successfully",
      transaction: result.transaction,
    }
  }

  // Admin approves merchant deposit (alternative flow)
  public async adminApproveCashDeposit(adminId: number, depositId: number) {
    // Find deposit
    const deposit = await MerchantDeposit.findByPk(depositId, {
      include: [{ model: Merchant }, { model: User, as: "student" }],
    })

    if (!deposit) {
      throw new HttpException(404, "Deposit not found")
    }

    if (deposit.status !== "pending") {
      throw new HttpException(400, `Deposit already ${deposit.status}`)
    }

    // Update deposit status
    deposit.status = "approved"
    deposit.approvedBy = adminId
    deposit.approvedAt = new Date()
    await deposit.save()

    // Find payment
    const payment = await Payment.findOne({
      where: { reference: deposit.reference },
    })

    if (!payment) {
      throw new HttpException(404, "Payment record not found")
    }

    // Process the payment
    const result = await this.processPayment(payment.id)

    // Send notifications
    await this.notificationService.sendSMS({
      userId: deposit.studentId,
      message: `Your cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) has been approved. New balance: ${result.wallet.balance} CUTcoins.`,
    })

    await this.notificationService.sendSMS({
      userId: deposit.merchant.userId,
      message: `Cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) for student ${deposit.student.firstName} ${deposit.student.lastName} has been approved by admin.`,
    })

    return {
      success: true,
      message: "Cash deposit approved successfully",
      transaction: result.transaction,
    }
  }

  // Get merchant deposits
  public async getMerchantDeposits(merchantId: number, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {
      merchantId,
    }

    if (query.status) {
      whereClause.status = query.status
    }

    const { count, rows } = await MerchantDeposit.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "student",
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    return {
      deposits: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  // Get student deposits
  public async getStudentDeposits(studentId: number, query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {
      userId: studentId,
    }

    if (query.status) {
      whereClause.status = query.status
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    return {
      deposits: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  // Get merchant deposit details
  public async getMerchantDepositDetails(merchantId: number, depositId: number) {
    const deposit = await MerchantDeposit.findOne({
      where: {
        id: depositId,
        merchantId,
      },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    if (!deposit) {
      throw new HttpException(404, "Deposit not found")
    }

    return deposit
  }

  // Admin methods for regulating token purchases

  // Get all payments for admin
  public async getAllPayments(query: { page?: number; limit?: number; status?: string; method?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {}

    if (query.status) {
      whereClause.status = query.status
    }

    if (query.method) {
      whereClause.paymentMethod = query.method
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    return {
      payments: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  // Get all merchant deposits for admin
  public async getAllMerchantDeposits(query: { page?: number; limit?: number; status?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {}

    if (query.status) {
      whereClause.status = query.status
    }

    const { count, rows } = await MerchantDeposit.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Merchant,
          attributes: ["id", "name", "location"],
        },
        {
          model: User,
          as: "student",
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    return {
      deposits: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  // Update system exchange rate
  public async updateExchangeRate(adminId: number, newRate: number) {
    if (newRate <= 0) {
      throw new HttpException(400, "Exchange rate must be greater than zero")
    }

    const config = await SystemConfig.findOne({
      where: { key: "exchange_rate" },
    })

    if (!config) {
      // Create new config
      await SystemConfig.create({
        key: "exchange_rate",
        value: newRate.toString(),
        description: "Exchange rate: 1 USD = X CUTcoins",
        isActive: true,
      })
    } else {
      // Update existing config
      await config.update({
        value: newRate.toString(),
      })
    }

    return {
      success: true,
      message: "Exchange rate updated successfully",
      newRate,
    }
  }

  // Set merchant deposit limits
  public async setMerchantDepositLimits(adminId: number, limits: { daily: number; monthly: number }) {
    if (limits.daily <= 0 || limits.monthly <= 0) {
      throw new HttpException(400, "Limits must be greater than zero")
    }

    if (limits.daily > limits.monthly) {
      throw new HttpException(400, "Daily limit cannot be greater than monthly limit")
    }

    // Update daily limit
    const dailyConfig = await SystemConfig.findOne({
      where: { key: "merchant_daily_deposit_limit" },
    })

    if (!dailyConfig) {
      await SystemConfig.create({
        key: "merchant_daily_deposit_limit",
        value: limits.daily.toString(),
        description: "Maximum daily deposit limit for merchants in USD",
        isActive: true,
      })
    } else {
      await dailyConfig.update({
        value: limits.daily.toString(),
      })
    }

    // Update monthly limit
    const monthlyConfig = await SystemConfig.findOne({
      where: { key: "merchant_monthly_deposit_limit" },
    })

    if (!monthlyConfig) {
      await SystemConfig.create({
        key: "merchant_monthly_deposit_limit",
        value: limits.monthly.toString(),
        description: "Maximum monthly deposit limit for merchants in USD",
        isActive: true,
      })
    } else {
      await monthlyConfig.update({
        value: limits.monthly.toString(),
      })
    }

    return {
      success: true,
      message: "Merchant deposit limits updated successfully",
      limits,
    }
  }

  // Check if merchant is within deposit limits
  public async checkMerchantDepositLimits(merchantId: number, amount: number): Promise<boolean> {
    // Get limits from config
    const dailyLimitConfig = await SystemConfig.findOne({
      where: { key: "merchant_daily_deposit_limit", isActive: true },
    })

    const monthlyLimitConfig = await SystemConfig.findOne({
      where: { key: "merchant_monthly_deposit_limit", isActive: true },
    })

    const dailyLimit = dailyLimitConfig ? Number.parseFloat(dailyLimitConfig.value) : 1000 // Default 1000 USD
    const monthlyLimit = monthlyLimitConfig ? Number.parseFloat(monthlyLimitConfig.value) : 10000 // Default 10000 USD

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get first day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Calculate daily deposits
    const dailyDeposits = await Payment.sum("amount", {
      where: {
        merchantId,
        paymentMethod: "cash",
        createdAt: {
          [Op.gte]: today,
        },
        status: {
          [Op.in]: ["pending", "completed"],
        },
      },
    })

    // Calculate monthly deposits
    const monthlyDeposits = await Payment.sum("amount", {
      where: {
        merchantId,
        paymentMethod: "cash",
        createdAt: {
          [Op.gte]: firstDayOfMonth,
        },
        status: {
          [Op.in]: ["pending", "completed"],
        },
      },
    })

    // Check if new amount would exceed limits
    const newDailyTotal = (dailyDeposits || 0) + amount
    const newMonthlyTotal = (monthlyDeposits || 0) + amount

    return newDailyTotal <= dailyLimit && newMonthlyTotal <= monthlyLimit
  }
}
