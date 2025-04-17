"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const user_model_1 = require("../models/user.model");
const transaction_model_1 = require("../models/transaction.model");
const merchant_model_1 = require("../models/merchant.model");
const wallet_model_1 = require("../models/wallet.model");
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class AnalyticsService {
    async getDashboardStats() {
        // Get total users
        const totalUsers = await user_model_1.User.count();
        // Get total merchants
        const totalMerchants = await merchant_model_1.Merchant.count();
        // Get total transaction volume
        const transactionVolume = await transaction_model_1.Transaction.sum("amount");
        // Get total number of transactions
        const totalTransactions = await transaction_model_1.Transaction.count();
        return {
            totalUsers,
            totalMerchants,
            transactionVolume,
            totalTransactions,
        };
    }
    async getTransactionStats(query) {
        const whereClause = {};
        if (query.startDate && query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.between]: [new Date(query.startDate), new Date(query.endDate)],
            };
        }
        else if (query.startDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.gte]: new Date(query.startDate),
            };
        }
        else if (query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.lte]: new Date(query.endDate),
            };
        }
        if (query.type) {
            whereClause.type = query.type;
        }
        // Get daily transaction stats
        const dailyStats = await transaction_model_1.Transaction.findAll({
            attributes: [
                [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "date"],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
                [sequelize_2.default.fn("sum", sequelize_2.default.col("amount")), "volume"],
            ],
            where: whereClause,
            group: [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt"))],
            order: [[sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "ASC"]],
            raw: true,
        });
        // Get transaction type distribution
        const typeDistribution = await transaction_model_1.Transaction.findAll({
            attributes: ["type", [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"]],
            where: whereClause,
            group: ["type"],
            raw: true,
        });
        return {
            dailyStats,
            typeDistribution,
        };
    }
    async getUserStats(query) {
        const whereClause = {};
        if (query.startDate && query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.between]: [new Date(query.startDate), new Date(query.endDate)],
            };
        }
        else if (query.startDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.gte]: new Date(query.startDate),
            };
        }
        else if (query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.lte]: new Date(query.endDate),
            };
        }
        // Get daily user registrations
        const dailyRegistrations = await user_model_1.User.findAll({
            attributes: [
                [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "date"],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
            ],
            where: whereClause,
            group: [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt"))],
            order: [[sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "ASC"]],
            raw: true,
        });
        // Get KYC status distribution
        const kycDistribution = await user_model_1.User.findAll({
            attributes: ["kycStatus", [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"]],
            group: ["kycStatus"],
            raw: true,
        });
        return {
            dailyRegistrations,
            kycDistribution,
        };
    }
    async getMerchantStats(query) {
        const whereClause = {};
        if (query.startDate && query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.between]: [new Date(query.startDate), new Date(query.endDate)],
            };
        }
        else if (query.startDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.gte]: new Date(query.startDate),
            };
        }
        else if (query.endDate) {
            whereClause.createdAt = {
                [sequelize_1.Op.lte]: new Date(query.endDate),
            };
        }
        // Get daily merchant registrations
        const dailyRegistrations = await merchant_model_1.Merchant.findAll({
            attributes: [
                [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "date"],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
            ],
            where: whereClause,
            group: [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt"))],
            order: [[sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "ASC"]],
            raw: true,
        });
        // Get merchant status distribution
        const statusDistribution = await merchant_model_1.Merchant.findAll({
            attributes: ["status", [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"]],
            group: ["status"],
            raw: true,
        });
        // Get top merchants by transaction volume
        const topMerchants = await merchant_model_1.Merchant.findAll({
            attributes: ["id", "name", "location"],
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id"],
                    include: [
                        {
                            model: transaction_model_1.Transaction,
                            as: "receivedTransactions",
                            attributes: [[sequelize_2.default.fn("sum", sequelize_2.default.col("amount")), "totalAmount"]],
                            where: {
                                type: "payment",
                                ...whereClause,
                            },
                        },
                    ],
                },
            ],
            order: [[sequelize_2.default.literal('"user.receivedTransactions.totalAmount"'), "DESC"]],
            limit: 10,
        });
        return {
            dailyRegistrations,
            statusDistribution,
            topMerchants,
        };
    }
    async getWalletStats() {
        // Get total wallet balance
        const totalBalance = await wallet_model_1.Wallet.sum("balance");
        // Get wallet balance distribution
        const balanceDistribution = await wallet_model_1.Wallet.findAll({
            attributes: [
                [
                    sequelize_2.default.literal(`
            CASE
              WHEN balance < 100 THEN '0-100'
              WHEN balance >= 100 AND balance < 500 THEN '100-500'
              WHEN balance >= 500 AND balance < 1000 THEN '500-1000'
              WHEN balance >= 1000 AND balance < 5000 THEN '1000-5000'
              ELSE '5000+'
            END
          `),
                    "range",
                ],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
            ],
            group: [sequelize_2.default.fn('', sequelize_2.default.literal("range"))],
            raw: true,
        });
        return {
            totalBalance,
            balanceDistribution,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map