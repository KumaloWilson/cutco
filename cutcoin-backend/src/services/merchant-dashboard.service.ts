import { MerchantTransaction } from "../models/merchant-transaction.model"
import { MerchantDeposit } from "../models/merchant-deposit.model"
import { User } from "../models/user.model"
import { Wallet } from "../models/wallet.model"
import { sequelize } from "../app"
import { Op } from "sequelize"

export class MerchantDashboardService {
  public async getDashboardStats(merchantId: number) {
    // Get merchant's wallet
    const user = await User.findOne({
      where: { merchantId },
      include: [{ model: Wallet }],
    })

    if (!user || !user.wallet) {
      throw new Error("Merchant wallet not found")
    }

    // Get total transactions count
    const totalTransactions = await MerchantTransaction.count({
      where: { merchantId },
    })

    // Get total transaction volume
    const transactionVolume = await MerchantTransaction.sum("amount", {
      where: { merchantId },
    })

    // Get pending transactions count
    const pendingTransactions = await MerchantTransaction.count({
      where: {
        merchantId,
        status: "pending",
      },
    })

    // Get total deposits
    const totalDeposits = await MerchantDeposit.sum("amount", {
      where: { merchantId },
    })

    // Get current balance
    const currentBalance = user.wallet.balance

    return {
      totalTransactions: totalTransactions || 0,
      transactionVolume: transactionVolume || 0,
      pendingTransactions: pendingTransactions || 0,
      totalDeposits: totalDeposits || 0,
      currentBalance,
    }
  }

  public async getRecentTransactions(merchantId: number, limit = 5) {
    const transactions = await MerchantTransaction.findAll({
      where: { merchantId },
      order: [["createdAt", "DESC"]],
      limit,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    return transactions
  }

  public async getTransactionStats(merchantId: number, period: string) {
    let startDate: Date
    const endDate = new Date()

    // Determine the start date based on the period
    switch (period) {
      case "week":
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        break
      case "month":
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "year":
        startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get daily transaction stats
    const dailyStats = await MerchantTransaction.findAll({
      attributes: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "date"],
        [sequelize.fn("count", sequelize.col("id")), "count"],
        [sequelize.fn("sum", sequelize.col("amount")), "volume"],
      ],
      where: {
        merchantId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("date_trunc", "day", sequelize.col("createdAt"))],
      order: [[sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    })

    // Get transaction status distribution
    const statusDistribution = await MerchantTransaction.findAll({
      attributes: ["status", [sequelize.fn("count", sequelize.col("id")), "count"]],
      where: {
        merchantId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ["status"],
      raw: true,
    })

    return {
      dailyStats,
      statusDistribution,
    }
  }

  public async getDepositStats(merchantId: number, period: string) {
    let startDate: Date
    const endDate = new Date()

    // Determine the start date based on the period
    switch (period) {
      case "week":
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
        break
      case "month":
        startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case "year":
        startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate = new Date()
        startDate.setDate(startDate.getDate() - 7)
    }

    // Get daily deposit stats
    const dailyStats = await MerchantDeposit.findAll({
      attributes: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "date"],
        [sequelize.fn("count", sequelize.col("id")), "count"],
        [sequelize.fn("sum", sequelize.col("amount")), "volume"],
      ],
      where: {
        merchantId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: [sequelize.fn("date_trunc", "day", sequelize.col("createdAt"))],
      order: [[sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    })

    // Get deposit status distribution
    const statusDistribution = await MerchantDeposit.findAll({
      attributes: ["status", [sequelize.fn("count", sequelize.col("id")), "count"]],
      where: {
        merchantId,
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
      group: ["status"],
      raw: true,
    })

    return {
      dailyStats,
      statusDistribution,
    }
  }
}
