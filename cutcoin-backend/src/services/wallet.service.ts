import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { Transaction } from "../models/transaction.model"
import { OTP } from "../models/otp.model"
import { HttpException } from "../exceptions/HttpException"
import { generateOTP, generateTransactionReference } from "../utils/generators"
import { sendSMS } from "../utils/sms"
import { sequelize } from "../app"
import type { Transaction as SequelizeTransaction } from "sequelize"

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

  public async deposit(userId: number, amount: number) {
    if (amount <= 0) {
      throw new HttpException(400, "Deposit amount must be greater than zero")
    }

    // Find user wallet
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) {
      throw new HttpException(404, "Wallet not found")
    }

    // Process deposit in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update wallet balance
      wallet.balance = Number(wallet.balance) + amount
      await wallet.save({ transaction: t })

      // Create transaction record
      const reference = generateTransactionReference()
      const transaction = await Transaction.create(
        {
          senderId: userId,
          receiverId: userId,
          amount,
          type: "deposit",
          status: "completed",
          reference,
          description: "Deposit to wallet",
          fee: 0,
        },
        { transaction: t },
      )

      return { wallet, transaction }
    })

    // Send SMS notification
    const user = await User.findByPk(userId)
    if (user) {
      await sendSMS(
        user.phoneNumber,
        `Your CUTcoin wallet has been credited with ${amount} CUTcoins. New balance: ${result.wallet.balance} CUTcoins.`,
      )
    }

    return {
      message: "Deposit successful",
      balance: result.wallet.balance,
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

  public async withdraw(userId: number, amount: number) {
    if (amount <= 0) {
      throw new HttpException(400, "Withdrawal amount must be greater than zero")
    }

    // Find user wallet
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) {
      throw new HttpException(404, "Wallet not found")
    }

    // Check if wallet has sufficient balance
    if (Number(wallet.balance) < amount) {
      throw new HttpException(400, "Insufficient balance")
    }

    // Calculate fee (1% for withdrawals above 2000 CUTcoins)
    const fee = amount > 2000 ? amount * 0.01 : 0
    const totalAmount = amount + fee

    if (Number(wallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Generate OTP for withdrawal verification
    const user = await User.findByPk(userId)
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    const otpCode = generateOTP()
    await OTP.create({
      userId,
      phoneNumber: user.phoneNumber,
      code: otpCode,
      purpose: "transaction",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via SMS
    await sendSMS(
      user.phoneNumber,
      `Your CUTcoin withdrawal verification code is: ${otpCode}. Amount: ${amount} CUTcoins. Valid for 10 minutes.`,
    )

    return {
      message: "OTP sent for withdrawal verification",
      amount,
      fee,
      totalAmount,
    }
  }

  public async confirmWithdrawal(userId: number, data: { amount: number; code: string }) {
    const { amount, code } = data

    // Verify OTP
    const otp = await OTP.findOne({
      where: {
        userId,
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

    // Find user wallet
    const wallet = await Wallet.findOne({ where: { userId } })
    if (!wallet) {
      throw new HttpException(404, "Wallet not found")
    }

    // Calculate fee (1% for withdrawals above 2000 CUTcoins)
    const fee = amount > 2000 ? amount * 0.01 : 0
    const totalAmount = amount + fee

    // Check if wallet has sufficient balance
    if (Number(wallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

    // Process withdrawal in a transaction
    const result = await sequelize.transaction(async (t: SequelizeTransaction) => {
      // Update wallet balance
      wallet.balance = Number(wallet.balance) - totalAmount
      await wallet.save({ transaction: t })

      // Create transaction record
      const reference = generateTransactionReference()
      const transaction = await Transaction.create(
        {
          senderId: userId,
          receiverId: null,
          amount,
          type: "withdrawal",
          status: "completed",
          reference,
          description: "Withdrawal from wallet",
          fee,
        },
        { transaction: t },
      )

      return { wallet, transaction }
    })

    // Send SMS notification
    const user = await User.findByPk(userId)
    if (user) {
      await sendSMS(
        user.phoneNumber,
        `Your withdrawal of ${amount} CUTcoins has been processed. Fee: ${fee} CUTcoins. New balance: ${result.wallet.balance} CUTcoins.`,
      )
    }

    return {
      message: "Withdrawal successful",
      balance: result.wallet.balance,
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
      purpose: "transaction",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })

    // Send OTP via SMS
    await sendSMS(
      sender.phoneNumber,
      `Your CUTcoin transfer verification code is: ${otpCode}. Amount: ${amount} CUTcoins to ${recipientUser.firstName} ${recipientUser.lastName}. Valid for 10 minutes.`,
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

    // Calculate fee (0.5% for transfers above 1000 CUTcoins)
    const fee = amount > 1000 ? amount * 0.005 : 0
    const totalAmount = amount + fee

    // Check if sender wallet has sufficient balance
    if (Number(senderWallet.balance) < totalAmount) {
      throw new HttpException(400, "Insufficient balance including fees")
    }

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
          description: `Transfer to ${recipientUser.firstName} ${recipientUser.lastName}`,
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
