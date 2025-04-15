import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { Transaction } from "../models/transaction.model"
import { OTP } from "../models/otp.model"
import { Merchant } from "../models/merchant.model"
import { MerchantTransaction } from "../models/merchant-transaction.model"
import { HttpException } from "../exceptions/HttpException"
import { generateOTP, generateTransactionReference } from "../utils/generators"
import { sendSMS } from "../utils/sms"
import sequelize  from "../config/sequelize"
import type { Transaction as SequelizeTransaction } from "sequelize"
import { Op } from "sequelize"

export class WalletService {
  public async getWalletBalance(userId: number) {
    const wallet = await Wallet.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    if (!wallet) {
      throw new HttpException(404, "Wallet not found")
    }

    return {
      walletAddress: wallet.walletAddress,
      balance: wallet.balance,
      user: wallet.user,
    }
  }

  public async initiateDeposit(userId: number, data: { amount: number; merchantNumber: string }) {
    const { amount, merchantNumber } = data

    if (amount <= 0) {
      throw new HttpException(400, "Deposit amount must be greater than zero")
    }

    // Find merchant by merchant number
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

    // Find user
    const user = await User.findByPk(userId, {
      include: [{ model: Wallet }],
    })
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Generate a unique reference
    const reference = generateTransactionReference()

    // Create a pending merchant transaction
    const merchantTransaction = await MerchantTransaction.create({
      userId,
      merchantId: merchant.id,
      type: "deposit",
      amount,
      reference,
      status: "pending",
      studentConfirmed: true, // Student initiates, so automatically confirmed
      merchantConfirmed: false,
      description: `Deposit via merchant ${merchant.name} (${merchant.merchantNumber})`,
    })

    // Send notification to merchant
    await sendSMS(
      merchant.user.phoneNumber,
      `A deposit request of ${amount} CUTcoins has been initiated by ${user.firstName} ${user.lastName} (${user.studentId}). Reference: ${reference}. Please confirm the cash receipt.`,
    )

    // Send confirmation to student
    await sendSMS(
      user.phoneNumber,
      `Your deposit request of ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}) has been initiated. Reference: ${reference}. Please wait for merchant confirmation.`,
    )

    return {
      message: "Deposit request initiated successfully. Waiting for merchant confirmation.",
      reference,
      amount,
      merchantName: merchant.name,
      merchantNumber: merchant.merchantNumber,
      status: "pending",
    }
  }

  public async merchantConfirmDeposit(merchantUserId: number, data: { reference: string }) {
    const { reference } = data

    // Find the merchant
    const merchant = await Merchant.findOne({
      where: { userId: merchantUserId, status: "approved", isActive: true },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found or not active")
    }

    // Find the merchant transaction
    const merchantTransaction = await MerchantTransaction.findOne({
      where: {
        reference,
        merchantId: merchant.id,
        type: "deposit",
        status: "pending",
      },
      include: [
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
          include: [{ model: Wallet }],
        },
      ],
    })

    if (!merchantTransaction) {
      throw new HttpException(404, "Deposit transaction not found or already processed")
    }

    // Process the deposit in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update merchant transaction status
      merchantTransaction.merchantConfirmed = true
      merchantTransaction.status = "completed"
      merchantTransaction.completedAt = new Date()
      await merchantTransaction.save({ transaction: t })

      // Update user wallet balance
      const wallet = merchantTransaction.user.wallet
      wallet.balance = Number(wallet.balance) + Number(merchantTransaction.amount)
      await wallet.save({ transaction: t })

      // Create transaction record
      const transaction = await Transaction.create(
        {
          senderId: merchantTransaction.userId,
          receiverId: merchantTransaction.userId, // Self-deposit
          amount: merchantTransaction.amount,
          type: "deposit",
          status: "completed",
          reference: merchantTransaction.reference,
          description: merchantTransaction.description,
          fee: 0,
        },
        { transaction: t },
      )

      return { wallet, transaction, merchantTransaction }
    })

    // Send notifications
    await sendSMS(
      merchantTransaction.user.phoneNumber,
      `Your deposit of ${merchantTransaction.amount} CUTcoins has been confirmed by merchant ${merchant.name}. New balance: ${result.wallet.balance} CUTcoins.`,
    )

    return {
      message: "Deposit confirmed successfully",
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        status: result.transaction.status,
        reference: result.transaction.reference,
        createdAt: result.transaction.createdAt,
      },
    }
  }

  public async initiateWithdrawal(userId: number, data: { amount: number; merchantNumber: string }) {
    const { amount, merchantNumber } = data

    if (amount <= 0) {
      throw new HttpException(400, "Withdrawal amount must be greater than zero")
    }

    // Find merchant by merchant number
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

    // Find user with wallet
    const user = await User.findByPk(userId, {
      include: [{ model: Wallet }],
    })
    if (!user || !user.wallet) {
      throw new HttpException(404, "User wallet not found")
    }

    // Calculate fee (1% for withdrawals above 2000 CUTcoins)
    const fee = amount > 2000 ? amount * 0.01 : 0
    const totalAmount = amount + fee

    // Check if wallet has sufficient balance
    if (Number(user.wallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Generate OTP for withdrawal verification
    const otpCode = generateOTP()
    await OTP.create({
      userId,
      phoneNumber: user.phoneNumber,
      code: otpCode,
      purpose: "withdrawal",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via SMS
    await sendSMS(
      user.phoneNumber,
      `Your CUTcoin withdrawal verification code is: ${otpCode}. Amount: ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}). Fee: ${fee} CUTcoins. Valid for 10 minutes.`,
    )

    return {
      message: "OTP sent for withdrawal verification",
      amount,
      fee,
      totalAmount,
      merchantName: merchant.name,
      merchantNumber: merchant.merchantNumber,
    }
  }

  public async confirmWithdrawalOTP(userId: number, data: { amount: number; merchantNumber: string; code: string }) {
    const { amount, merchantNumber, code } = data

    // Verify OTP
    const otp = await OTP.findOne({
      where: {
        userId,
        code,
        purpose: "withdrawal",
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

    // Find merchant by merchant number
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

    // Find user with wallet
    const user = await User.findByPk(userId, {
      include: [{ model: Wallet }],
    })
    if (!user || !user.wallet) {
      throw new HttpException(404, "User wallet not found")
    }

    // Calculate fee (1% for withdrawals above 2000 CUTcoins)
    const fee = amount > 2000 ? amount * 0.01 : 0
    const totalAmount = amount + fee

    // Check if wallet has sufficient balance
    if (Number(user.wallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Generate a unique reference
    const reference = generateTransactionReference()

    // Create a pending merchant transaction
    const merchantTransaction = await MerchantTransaction.create({
      userId,
      merchantId: merchant.id,
      type: "withdrawal",
      amount,
      fee,
      reference,
      status: "pending",
      studentConfirmed: true, // Student initiates, so automatically confirmed
      merchantConfirmed: false,
      description: `Withdrawal via merchant ${merchant.name} (${merchant.merchantNumber})`,
    })

    // Deduct the amount from the user's wallet immediately to prevent double spending
    await sequelize.transaction(async (t: SequelizeTransaction) => {
      user.wallet.balance = Number(user.wallet.balance) - totalAmount
      await user.wallet.save({ transaction: t })
    })

    // Send notification to merchant
    await sendSMS(
      merchant.user.phoneNumber,
      `A withdrawal request of ${amount} CUTcoins has been initiated by ${user.firstName} ${user.lastName} (${user.studentId}). Reference: ${reference}. Please provide the cash and confirm.`,
    )

    // Send confirmation to student
    await sendSMS(
      user.phoneNumber,
      `Your withdrawal request of ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}) has been initiated. Reference: ${reference}. Please collect your cash from the merchant.`,
    )

    return {
      message: "Withdrawal request initiated successfully. Waiting for merchant confirmation.",
      reference,
      amount,
      fee,
      totalAmount,
      merchantName: merchant.name,
      merchantNumber: merchant.merchantNumber,
      status: "pending",
    }
  }

  public async merchantConfirmWithdrawal(merchantUserId: number, data: { reference: string }) {
    const { reference } = data

    // Find the merchant
    const merchant = await Merchant.findOne({
      where: { userId: merchantUserId, status: "approved", isActive: true },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found or not active")
    }

    // Find the merchant transaction
    const merchantTransaction = await MerchantTransaction.findOne({
      where: {
        reference,
        merchantId: merchant.id,
        type: "withdrawal",
        status: "pending",
      },
      include: [
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    if (!merchantTransaction) {
      throw new HttpException(404, "Withdrawal transaction not found or already processed")
    }

    // Process the withdrawal in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update merchant transaction status
      merchantTransaction.merchantConfirmed = true
      merchantTransaction.status = "completed"
      merchantTransaction.completedAt = new Date()
      await merchantTransaction.save({ transaction: t })

      // Create transaction record
      const transaction = await Transaction.create(
        {
          senderId: merchantTransaction.userId,
          receiverId: merchant.userId, // Merchant receives the withdrawal
          amount: merchantTransaction.amount,
          type: "withdrawal",
          status: "completed",
          reference: merchantTransaction.reference,
          description: merchantTransaction.description,
          fee: merchantTransaction.fee || 0,
        },
        { transaction: t },
      )

      return { transaction, merchantTransaction }
    })

    // Send notifications
    await sendSMS(
      merchantTransaction.user.phoneNumber,
      `Your withdrawal of ${merchantTransaction.amount} CUTcoins has been confirmed by merchant ${merchant.name}. Fee: ${merchantTransaction.fee || 0} CUTcoins.`,
    )

    return {
      message: "Withdrawal confirmed successfully",
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        fee: result.transaction.fee,
        type: result.transaction.type,
        status: result.transaction.status,
        reference: result.transaction.reference,
        createdAt: result.transaction.createdAt,
      },
    }
  }

  public async cancelMerchantTransaction(userId: number, data: { reference: string }) {
    const { reference } = data

    // Find the merchant transaction
    const merchantTransaction = await MerchantTransaction.findOne({
      where: {
        reference,
        userId,
        status: "pending",
      },
      include: [
        {
          model: Merchant,
          include: [
            {
              model: User,
              attributes: ["phoneNumber"],
            },
          ],
        },
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
          include: [{ model: Wallet }],
        },
      ],
    })

    if (!merchantTransaction) {
      throw new HttpException(404, "Transaction not found or already processed")
    }

    // Process the cancellation in a transaction
    await sequelize.transaction(async (t: SequelizeTransaction) => {
      // If it's a withdrawal, refund the amount to the user's wallet
      if (merchantTransaction.type === "withdrawal") {
        const totalAmount = Number(merchantTransaction.amount) + Number(merchantTransaction.fee || 0)
        merchantTransaction.user.wallet.balance = Number(merchantTransaction.user.wallet.balance) + totalAmount
        await merchantTransaction.user.wallet.save({ transaction: t })
      }

      // Update merchant transaction status
      merchantTransaction.status = "cancelled"
      merchantTransaction.cancelledAt = new Date()
      await merchantTransaction.save({ transaction: t })
    })

    // Send notifications
    await sendSMS(
      merchantTransaction.user.phoneNumber,
      `Your ${merchantTransaction.type} of ${merchantTransaction.amount} CUTcoins via merchant ${merchantTransaction.merchant.name} has been cancelled.`,
    )

    await sendSMS(
      merchantTransaction.merchant.user.phoneNumber,
      `A ${merchantTransaction.type} request of ${merchantTransaction.amount} CUTcoins by ${merchantTransaction.user.firstName} ${merchantTransaction.user.lastName} has been cancelled.`,
    )

    return {
      message: `${merchantTransaction.type.charAt(0).toUpperCase() + merchantTransaction.type.slice(1)} cancelled successfully`,
      reference: merchantTransaction.reference,
    }
  }

  public async getMerchantPendingTransactions(merchantUserId: number) {
    // Find the merchant
    const merchant = await Merchant.findOne({
      where: { userId: merchantUserId, status: "approved", isActive: true },
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found or not active")
    }

    // Find pending transactions
    const pendingTransactions = await MerchantTransaction.findAll({
      where: {
        merchantId: merchant.id,
        status: "pending",
      },
      include: [
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    return {
      pendingTransactions: pendingTransactions.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        amount: Number(tx.amount),
        fee: tx.fee ? Number(tx.fee) : 0,
        status: tx.status,
        description: tx.description,
        createdAt: tx.createdAt,
        student: {
          studentId: tx.user.studentId,
          name: `${tx.user.firstName} ${tx.user.lastName}`,
          phoneNumber: tx.user.phoneNumber,
        },
      })),
    }
  }

  public async getUserPendingTransactions(userId: number) {
    // Find pending transactions
    const pendingTransactions = await MerchantTransaction.findAll({
      where: {
        userId,
        status: "pending",
      },
      include: [
        {
          model: Merchant,
          attributes: ["id", "name", "merchantNumber", "location"],
          include: [
            {
              model: User,
              attributes: ["phoneNumber"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    })

    return {
      pendingTransactions: pendingTransactions.map((tx) => ({
        id: tx.id,
        reference: tx.reference,
        type: tx.type,
        amount: Number(tx.amount),
        fee: tx.fee ? Number(tx.fee) : 0,
        status: tx.status,
        description: tx.description,
        createdAt: tx.createdAt,
        merchant: {
          name: tx.merchant.name,
          merchantNumber: tx.merchant.merchantNumber,
          location: tx.merchant.location,
          phoneNumber: tx.merchant.user.phoneNumber,
        },
      })),
    }
  }

  public async transfer(userId: number, data: { recipientId: string; amount: number }) {
    const { recipientId, amount } = data

    if (amount <= 0) {
      throw new HttpException(400, "Transfer amount must be greater than zero")
    }

    // Find sender wallet
    const senderWallet = await Wallet.findOne({ where: { userId } })
    if (!senderWallet) {
      throw new HttpException(404, "Sender wallet not found")
    }

    // Find recipient user by student ID
    const recipientUser = await User.findOne({
      where: { studentId: recipientId },
      include: [{ model: Wallet }],
    })

    if (!recipientUser || !recipientUser.wallet) {
      throw new HttpException(404, "Recipient not found")
    }

    // Prevent self-transfers
    if (userId === recipientUser.id) {
      throw new HttpException(400, "Cannot transfer to yourself")
    }

    // Calculate fee (0.5% for transfers above 1000 CUTcoins)
    const fee = amount > 1000 ? amount * 0.005 : 0
    const totalAmount = amount + fee

    // Check if sender wallet has sufficient balance
    if (Number(senderWallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Generate OTP for transfer verification
    const sender = await User.findByPk(userId)
    if (!sender) {
      throw new HttpException(404, "Sender not found")
    }

    const otpCode = generateOTP()
    await OTP.create({
      userId,
      phoneNumber: sender.phoneNumber,
      code: otpCode,
      purpose: "transfer",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via SMS
    await sendSMS(
      sender.phoneNumber,
      `Your CUTcoin transfer verification code is: ${otpCode}. Amount: ${amount} CUTcoins to ${recipientUser.firstName} ${recipientUser.lastName} (${recipientUser.studentId}). Valid for 10 minutes.`,
    )

    return {
      message: "OTP sent for transfer verification",
      recipient: {
        studentId: recipientUser.studentId,
        name: `${recipientUser.firstName} ${recipientUser.lastName}`,
      },
      amount,
      fee,
      totalAmount,
    }
  }

  public async confirmTransfer(userId: number, data: { recipientId: string; amount: number; code: string }) {
    const { recipientId, amount, code } = data

    // Verify OTP
    const otp = await OTP.findOne({
      where: {
        userId,
        code,
        purpose: "transfer",
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

    // Find sender wallet
    const senderWallet = await Wallet.findOne({ where: { userId } })
    if (!senderWallet) {
      throw new HttpException(404, "Sender wallet not found")
    }

    // Find recipient user by student ID
    const recipientUser = await User.findOne({
      where: { studentId: recipientId },
      include: [{ model: Wallet }],
    })

    if (!recipientUser || !recipientUser.wallet) {
      throw new HttpException(404, "Recipient not found")
    }

    // Prevent self-transfers
    if (userId === recipientUser.id) {
      throw new HttpException(400, "Cannot transfer to yourself")
    }

    // Calculate fee (0.5% for transfers above 1000 CUTcoins)
    const fee = amount > 1000 ? amount * 0.005 : 0
    const totalAmount = amount + fee

    // Check if sender wallet has sufficient balance
    if (Number(senderWallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Check for suspicious activity
    await this.checkForSuspiciousActivity(userId, recipientUser.id, amount)

    // Process transfer in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update sender wallet balance
      senderWallet.balance = Number(senderWallet.balance) - totalAmount
      await senderWallet.save({ transaction: t })

      // Update recipient wallet balance
      recipientUser.wallet.balance = Number(recipientUser.wallet.balance) + amount
      await recipientUser.wallet.save({ transaction: t })

      // Create transaction record
      const reference = generateTransactionReference()
      const transaction = await Transaction.create(
        {
          senderId: userId,
          receiverId: recipientUser.id,
          amount,
          type: "transfer",
          status: "completed",
          reference,
          description: `Transfer to ${recipientUser.firstName} ${recipientUser.lastName} (${recipientUser.studentId})`,
          fee,
        },
        { transaction: t },
      )

      return { senderWallet, transaction }
    })

    // Send SMS notifications
    const sender = await User.findByPk(userId)
    if (sender) {
      await sendSMS(
        sender.phoneNumber,
        `Your transfer of ${amount} CUTcoins to ${recipientUser.firstName} ${recipientUser.lastName} was successful. Fee: ${fee} CUTcoins. New balance: ${result.senderWallet.balance} CUTcoins.`,
      )
    }

    await sendSMS(
      recipientUser.phoneNumber,
      `You have received ${amount} CUTcoins from ${sender?.firstName} ${sender?.lastName}. New balance: ${recipientUser.wallet.balance} CUTcoins.`,
    )

    return {
      message: "Transfer successful",
      balance: result.senderWallet.balance,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        fee: result.transaction.fee,
        type: result.transaction.type,
        status: result.transaction.status,
        reference: result.transaction.reference,
        recipient: `${recipientUser.firstName} ${recipientUser.lastName}`,
        createdAt: result.transaction.createdAt,
      },
    }
  }

  private async checkForSuspiciousActivity(senderId: number, receiverId: number, amount: number) {
    // Check for unusual transaction amount
    const userAvgTransaction = (await Transaction.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("amount")), "avgAmount"]],
      where: {
        senderId,
        type: "transfer",
        status: "completed",
      },
      raw: true,
    })) as { avgAmount?: string } | null

    const avgAmount = userAvgTransaction?.avgAmount ? Number(userAvgTransaction.avgAmount) : 0

    // If this transaction is significantly larger than average (3x) and above 5000
    if (avgAmount > 0 && amount > avgAmount * 3 && amount > 5000) {
      // Log suspicious activity
      console.warn(
        `Suspicious transfer detected: User ${senderId} transferring ${amount} to ${receiverId}, avg is ${avgAmount}`,
      )

      // Could implement additional verification here if needed
      // For now, we'll just let it proceed with the existing OTP verification
    }

    // Check for multiple transfers to the same recipient in a short time
    const recentTransfers = await Transaction.count({
      where: {
        senderId,
        receiverId,
        type: "transfer",
        status: "completed",
        createdAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    })

    // If there are already 5 or more transfers to this recipient in the last 24 hours
    if (recentTransfers >= 5) {
      console.warn(
        `Suspicious pattern detected: User ${senderId} made ${recentTransfers} transfers to ${receiverId} in 24 hours`,
      )
      // Could implement additional verification here if needed
    }

    // Check for daily transfer limit
    const dailyTransfers = await Transaction.sum("amount", {
      where: {
        senderId,
        type: "transfer",
        status: "completed",
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
    })

    const dailyLimit = 50000 // Example limit: 50,000 CUTcoins per day
    if ((dailyTransfers || 0) + amount > dailyLimit) {
      throw new HttpException(400, `Daily transfer limit of ${dailyLimit} CUTcoins exceeded`)
    }
  }

  public async getTransactionHistory(userId: number, query: { page?: number; limit?: number; type?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    }

    if (query.type) {
      whereClause.type = query.type
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["studentId", "firstName", "lastName"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    // Format transactions for better readability
    const transactions = rows.map((transaction) => {
      const isSender = transaction.senderId === userId
      const isReceiver = transaction.receiverId === userId
      const isDeposit = transaction.type === "deposit"
      const isWithdrawal = transaction.type === "withdrawal"

      let description = transaction.description
      let amount = Number(transaction.amount)

      if (transaction.type === "transfer") {
        if (isSender) {
          description = `Transfer to ${transaction.receiver?.firstName} ${transaction.receiver?.lastName}`
          amount = -amount // Negative for outgoing
        } else if (isReceiver) {
          description = `Transfer from ${transaction.sender?.firstName} ${transaction.sender?.lastName}`
        }
      } else if (isDeposit) {
        description = "Deposit to wallet"
      } else if (isWithdrawal) {
        description = "Withdrawal from wallet"
        amount = -amount // Negative for outgoing
      }

      return {
        id: transaction.id,
        reference: transaction.reference,
        amount,
        fee: Number(transaction.fee),
        type: transaction.type,
        status: transaction.status,
        description,
        createdAt: transaction.createdAt,
        sender: transaction.sender
          ? {
              studentId: transaction.sender.studentId,
              name: `${transaction.sender.firstName} ${transaction.sender.lastName}`,
            }
          : null,
        receiver: transaction.receiver
          ? {
              studentId: transaction.receiver.studentId,
              name: `${transaction.receiver.firstName} ${transaction.receiver.lastName}`,
            }
          : null,
      }
    })

    return {
      transactions,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  public async getTransactionDetails(userId: number, transactionId: number) {
    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        $or: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    if (!transaction) {
      throw new HttpException(404, "Transaction not found")
    }

    return {
      id: transaction.id,
      reference: transaction.reference,
      amount: Number(transaction.amount),
      fee: Number(transaction.fee),
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt,
      sender: transaction.sender
        ? {
            studentId: transaction.sender.studentId,
            name: `${transaction.sender.firstName} ${transaction.sender.lastName}`,
          }
        : null,
      receiver: transaction.receiver
        ? {
            studentId: transaction.receiver.studentId,
            name: `${transaction.receiver.firstName} ${transaction.receiver.lastName}`,
          }
        : null,
    }
  }
}
