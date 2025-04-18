import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { Transaction } from "../models/transaction.model"
import { Merchant } from "../models/merchant.model"
import { OTP } from "../models/otp.model"
import { HttpException } from "../exceptions/HttpException"
import { generateOTP, generateTransactionReference } from "../utils/generators"
import { sendSMS } from "../utils/sms"
import type { Transaction as SequelizeTransaction } from "sequelize"
import sequelize from "../config/sequelize"
import MerchantTransaction from "../models/merchant-transaction.model"
import { calculateWaitingTime } from "../utils/helpers"

export class MerchantService {
  public async registerMerchant(
    userId: number,
    merchantData: {
      name: string
      location: string
      description: string
      contactPerson: string
      contactPhone: string
    },
  ) {
    // Check if user already has a merchant account
    const existingMerchant = await Merchant.findOne({ where: { userId } })
    if (existingMerchant) {
      throw new HttpException(409, "User already has a merchant account")
    }

    // Create merchant account
    const merchant = await Merchant.create({
      userId,
      name: merchantData.name,
      location: merchantData.location,
      description: merchantData.description,
      contactPerson: merchantData.contactPerson,
      contactPhone: merchantData.contactPhone,
      status: "pending",
    })

    return {
      message: "Merchant registration successful. Pending approval.",
      merchantId: merchant.id,
      merchantNumber: merchant.merchantNumber,
    }
  }

  public async getMerchantProfile(userId: number) {
    const merchant = await Merchant.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant profile not found")
    }

    return merchant
  }

  public async getMerchantByNumber(merchantNumber: string) {
    const merchant = await Merchant.findOne({
      where: { merchantNumber, status: "approved", isActive: true },
      include: [
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found or not active")
    }

    return merchant
  }

  public async updateMerchantProfile(
    userId: number,
    merchantData: {
      name?: string
      location?: string
      description?: string
      contactPerson?: string
      contactPhone?: string
    },
  ) {
    const merchant = await Merchant.findOne({ where: { userId } })
    if (!merchant) {
      throw new HttpException(404, "Merchant profile not found")
    }

    // Update merchant data
    await merchant.update(merchantData)

    return {
      message: "Merchant profile updated successfully",
      merchant,
    }
  }

  public async initiatePayment(
    merchantId: number,
    paymentData: {
      customerStudentId: string
      amount: number
      description: string
    },
  ) {
    const { customerStudentId, amount, description } = paymentData

    if (amount <= 0) {
      throw new HttpException(400, "Payment amount must be greater than zero")
    }

    // Find merchant
    const merchant = await Merchant.findByPk(merchantId)
    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Check if merchant is approved
    if (merchant.status !== "approved") {
      throw new HttpException(403, "Merchant account is not approved")
    }

    // Find customer by student ID
    const customer = await User.findOne({
      where: { studentId: customerStudentId },
      include: [{ model: Wallet }],
    })

    if (!customer || !customer.wallet) {
      throw new HttpException(404, "Customer not found")
    }

    // Check if customer wallet has sufficient balance
    if (Number(customer.wallet.balance) < amount) {
      throw new HttpException(400, "Insufficient balance")
    }

    // Generate OTP for payment verification
    const otpCode = generateOTP()
    await OTP.create({
      userId: customer.id,
      phoneNumber: customer.phoneNumber,
      code: otpCode,
      purpose: "transaction",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via SMS
    await sendSMS(
      customer.phoneNumber,
      `Your CUTcoin payment verification code is: ${otpCode}. Amount: ${amount} CUTcoins to ${merchant.name} (${merchant.merchantNumber}). Valid for 10 minutes.`,
    )

    return {
      message: "OTP sent for payment verification",
      paymentDetails: {
        merchantName: merchant.name,
        merchantNumber: merchant.merchantNumber,
        amount,
        description,
      },
    }
  }

  public async confirmPayment(data: {
    merchantNumber: string
    customerStudentId: string
    amount: number
    code: string
    description: string
  }) {
    const { merchantNumber, customerStudentId, amount, code, description } = data

    // Find merchant by merchant number
    const merchant = await this.getMerchantByNumber(merchantNumber)
    if (!merchant) {
      throw new HttpException(404, "Merchant not found or not active")
    }

    // Find customer by student ID
    const customer = await User.findOne({
      where: { studentId: customerStudentId },
      include: [{ model: Wallet }],
    })

    if (!customer || !customer.wallet) {
      throw new HttpException(404, "Customer not found")
    }

    // Verify OTP
    const otp = await OTP.findOne({
      where: {
        userId: customer.id,
        code,
        purpose: "transaction",
        isUsed: false,
        expiresAt: { $gt: new Date() },
      },
    })

    if (!otp) {
      throw new HttpException(400, "Invalid or expired OTP")
    }

    // Mark OTP as used
    otp.isUsed = true
    await otp.save()

    // Find merchant user and wallet
    const merchantUser = await User.findByPk(merchant.userId, {
      include: [{ model: Wallet }],
    })

    if (!merchantUser || !merchantUser.wallet) {
      throw new HttpException(404, "Merchant wallet not found")
    }

    // Check if customer wallet has sufficient balance
    if (Number(customer.wallet.balance) < amount) {
      throw new HttpException(400, "Insufficient balance")
    }

    // Process payment in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update customer wallet balance
      customer.wallet.balance = Number(customer.wallet.balance) - amount
      await customer.wallet.save({ transaction: t })

      // Update merchant wallet balance
      merchantUser.wallet.balance = Number(merchantUser.wallet.balance) + amount
      await merchantUser.wallet.save({ transaction: t })

      // Create transaction record
      const reference = generateTransactionReference()
      const transaction = await Transaction.create(
        {
          senderId: customer.id,
          receiverId: merchantUser.id,
          amount,
          type: "payment",
          status: "completed",
          reference,
          description: `Payment to ${merchant.name} (${merchant.merchantNumber}): ${description}`,
          fee: 0,
        },
        { transaction: t },
      )

      return { customerWallet: customer.wallet, transaction }
    })

    // Send SMS notifications
    await sendSMS(
      customer.phoneNumber,
      `Your payment of ${amount} CUTcoins to ${merchant.name} (${merchant.merchantNumber}) was successful. New balance: ${result.customerWallet.balance} CUTcoins.`,
    )

    await sendSMS(
      merchantUser.phoneNumber,
      `You have received a payment of ${amount} CUTcoins from ${customer.firstName} ${customer.lastName}. Reference: ${result.transaction.reference}`,
    )

    return {
      message: "Payment successful",
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        status: result.transaction.status,
        reference: result.transaction.reference,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt,
      },
    }
  }

  public async getPendingMerchantTransactions(merchantId: number, query: { page?: number; limit?: number; type?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
  
    // Find merchant
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      throw new HttpException(404, "Merchant not found");
    }
  
    const whereClause: any = {
      merchantId: merchantId,
      status: "pending" // Always filter for pending status
    };
  
    // Add type filter if provided
    if (query.type) {
      whereClause.type = query.type;
    }
  
    const { count, rows } = await MerchantTransaction.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "ASC"]], // Oldest pending transactions first
      include: [
        {
          model: User,
          as: "user",
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    });
  
    // Format transactions for better readability
    const pendingTransactions = rows.map((transaction) => {
      return {
        id: transaction.id,
        reference: transaction.reference,
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        createdAt: transaction.createdAt,
        waitingTime: calculateWaitingTime(transaction.createdAt),
        customer: transaction.user
          ? {
              studentId: transaction.user.studentId,
              name: `${transaction.user.firstName} ${transaction.user.lastName}`,
            }
          : null,
        studentConfirmed: transaction.studentConfirmed,
        merchantConfirmed: transaction.merchantConfirmed
      };
    });
  
    return {
      pendingTransactions,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  public async getMerchantTransactions(merchantId: number, query: { page?: number; limit?: number; status?: string; type?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;
  
    // Find merchant
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      throw new HttpException(404, "Merchant not found");
    }
  
    const whereClause: any = {
      merchantId: merchantId
    };
  
    if (query.status) {
      whereClause.status = query.status;
    }
  
    if (query.type) {
      whereClause.type = query.type;
    }
  
    const { count, rows } = await MerchantTransaction.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user", // Changed from "sender" to match the model relationship
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    });
  
    // Format transactions for better readability
    const transactions = rows.map((transaction) => {
      return {
        id: transaction.id,
        reference: transaction.reference,
        amount: Number(transaction.amount),
        status: transaction.status,
        description: transaction.description,
        createdAt: transaction.createdAt,
        customer: transaction.user
          ? {
              studentId: transaction.user.studentId,
              name: `${transaction.user.firstName} ${transaction.user.lastName}`,
            }
          : null,
      };
    });
  
    return {
      transactions,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }
}
