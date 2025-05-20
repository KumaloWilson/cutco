"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const user_model_1 = require("../models/user.model");
const wallet_model_1 = require("../models/wallet.model");
const payment_model_1 = require("../models/payment.model");
const merchant_deposit_model_1 = require("../models/merchant-deposit.model");
const transaction_model_1 = require("../models/transaction.model");
const merchant_model_1 = require("../models/merchant.model");
const system_config_model_1 = require("../models/system-config.model");
const HttpException_1 = require("../exceptions/HttpException");
const notification_service_1 = require("./notification.service");
const generators_1 = require("../utils/generators");
const sequelize_1 = __importDefault(require("../config/sequelize"));
const paynow_service_1 = __importDefault(require("./paynow.service"));
const sequelize_2 = require("sequelize");
class PaymentService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    // Get exchange rate from system config
    async getExchangeRate() {
        const config = await system_config_model_1.SystemConfig.findOne({
            where: { key: "exchange_rate", isActive: true },
        });
        if (!config) {
            return 100; // Default: 1 USD = 100 CUTcoins
        }
        return Number.parseFloat(config.value);
    }
    // Calculate CUTcoin amount based on fiat amount
    async calculateCutcoinAmount(fiatAmount) {
        const exchangeRate = await this.getExchangeRate();
        return fiatAmount * exchangeRate;
    }
    // Initiate Paynow payment
    async initiatePaynowPayment(userId, amount) {
        // Validate amount
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Amount must be greater than zero");
        }
        // Find user
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Calculate CUTcoin amount
        const cutcoinAmount = await this.calculateCutcoinAmount(amount);
        // Generate reference
        const reference = (0, generators_1.generateTransactionReference)();
        // Create payment record
        const payment = await payment_model_1.Payment.create({
            userId,
            paymentMethod: "paynow",
            amount,
            cutcoinAmount,
            reference,
            status: "pending",
            metadata: {},
        });
        // Initialize Paynow payment
        const paymentResult = await paynow_service_1.default.initiateTransaction("kumalowilson900@gmail.com", user.phoneNumber || "", // Phone number
        amount, reference, `CUTcoin purchase: ${cutcoinAmount} CUTcoins` // Description
        );
        if (paymentResult.status !== "success") {
            // Update payment status to failed
            await payment.update({
                status: "failed",
                metadata: { error: paymentResult.error },
            });
            throw new HttpException_1.HttpException(500, paymentResult.error || "Payment initialization failed");
        }
        // Update payment with Paynow details
        await payment.update({
            metadata: {
                pollUrl: paymentResult.pollUrl,
                redirectUrl: paymentResult.redirectUrl,
            },
        });
        return {
            paymentId: payment.id,
            reference: payment.reference,
            amount,
            cutcoinAmount,
            redirectUrl: paymentResult.redirectUrl,
        };
    }
    // Verify Paynow payment
    async verifyPaynowPayment(reference) {
        var _a;
        // Find payment
        const payment = await payment_model_1.Payment.findOne({
            where: { reference, paymentMethod: "paynow" },
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment not found");
        }
        if (payment.status === "completed") {
            return {
                success: true,
                message: "Payment already processed",
                payment,
            };
        }
        // Get poll URL from metadata
        const pollUrl = (_a = payment.metadata) === null || _a === void 0 ? void 0 : _a.pollUrl;
        if (!pollUrl) {
            throw new HttpException_1.HttpException(400, "Invalid payment data");
        }
        // Check payment status
        const statusResult = await paynow_service_1.default.checkTransactionStatus(pollUrl);
        if (!statusResult.paid) {
            return {
                success: false,
                message: `Payment not completed. Status: ${statusResult.status}`,
                payment,
            };
        }
        // Process the payment
        const result = await this.processPayment(payment.id);
        return {
            success: true,
            message: "Payment processed successfully",
            transaction: result.transaction,
        };
    }
    /**
   * Update payment status from payment gateway webhook
   * @param reference Payment reference number
   * @param status Status from payment provider
   * @param pollurl URL to check payment status
   */
    async updatePaymentStatusFromWebhook(reference, status, pollurl) {
        var _a, _b, _c;
        // Find payment by reference number
        const payment = await payment_model_1.Payment.findOne({
            where: { reference },
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment not found");
        }
        // If no pollurl provided, use the one from the payment metadata
        const pollUrl = pollurl || ((_a = payment.metadata) === null || _a === void 0 ? void 0 : _a.pollUrl);
        if (!pollUrl) {
            throw new HttpException_1.HttpException(400, "Invalid payment data - no poll URL available");
        }
        // Check payment status from Paynow
        const paynowStatus = await paynow_service_1.default.checkTransactionStatus(pollUrl);
        // Determine if payment is completed based on Paynow status or webhook status
        if (((_b = paynowStatus.status) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === "paid" || (status === null || status === void 0 ? void 0 : status.toLowerCase()) === "paid") {
            // Only process if not already completed
            if (payment.status !== "completed") {
                // Process the payment
                const result = await this.processPayment(payment.id);
                return {
                    success: true,
                    message: "Payment processed successfully",
                    payment: {
                        id: payment.id,
                        reference: payment.reference,
                        status: "paid",
                    },
                    transaction: result.transaction
                };
            }
            else {
                return {
                    success: true,
                    message: "Payment already processed",
                    payment: {
                        id: payment.id,
                        reference: payment.reference,
                        status: payment.status,
                    }
                };
            }
        }
        else if (((_c = paynowStatus.status) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === "cancelled" || (status === null || status === void 0 ? void 0 : status.toLowerCase()) === "cancelled") {
            // Update payment status to failed
            payment.status = "failed";
            payment.metadata = {
                ...payment.metadata,
                status: paynowStatus.status,
                lastUpdated: new Date()
            };
            await payment.save();
            return {
                success: false,
                message: "Payment was cancelled",
                payment: {
                    id: payment.id,
                    reference: payment.reference,
                    status: payment.status,
                }
            };
        }
        else {
            // Payment is still pending
            return {
                success: false,
                message: "Payment is still pending",
                payment: {
                    id: payment.id,
                    reference: payment.reference,
                    status: payment.status,
                }
            };
        }
    }
    // Process completed payment
    async processPayment(paymentId) {
        // Find payment
        const payment = await payment_model_1.Payment.findByPk(paymentId, {
            include: [{ model: user_model_1.User }],
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment not found");
        }
        if (payment.status === "completed") {
            throw new HttpException_1.HttpException(400, "Payment already processed");
        }
        // Process in transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Find user wallet
            const wallet = await wallet_model_1.Wallet.findOne({
                where: { userId: payment.userId },
                transaction: t,
            });
            if (!wallet) {
                throw new HttpException_1.HttpException(404, "Wallet not found");
            }
            // Update wallet balance
            wallet.balance = Number(wallet.balance) + Number(payment.cutcoinAmount);
            await wallet.save({ transaction: t });
            // Create transaction record
            const transaction = await transaction_model_1.Transaction.create({
                senderId: payment.userId, // Self-deposit
                receiverId: payment.userId,
                amount: payment.cutcoinAmount,
                type: "deposit",
                status: "completed",
                reference: payment.reference,
                description: `Deposit via ${payment.paymentMethod}`,
                fee: 0,
            }, { transaction: t });
            // Update payment status
            payment.status = "completed";
            await payment.save({ transaction: t });
            return { wallet, transaction, payment };
        });
        // Send notification
        await this.notificationService.sendSMS({
            userId: payment.userId,
            message: `Your deposit of ${payment.cutcoinAmount} CUTcoins has been processed. New balance: ${result.wallet.balance} CUTcoins.`,
        });
        return result;
    }
    // Merchant deposits funds to their wallet
    async merchantDepositFunds(merchantUserId, data) {
        const { amount, paymentMethod } = data;
        // Validate amount
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Amount must be greater than zero");
        }
        // Find merchant
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId: merchantUserId, status: "approved", isActive: true },
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        // Find merchant user
        const merchantUser = await user_model_1.User.findByPk(merchantUserId, {
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!merchantUser || !merchantUser.wallet) {
            throw new HttpException_1.HttpException(404, "Merchant wallet not found");
        }
        // Calculate CUTcoin amount
        const cutcoinAmount = await this.calculateCutcoinAmount(amount);
        // Generate reference
        const reference = (0, generators_1.generateTransactionReference)();
        // Create payment record
        const payment = await payment_model_1.Payment.create({
            userId: merchantUserId,
            paymentMethod,
            amount,
            cutcoinAmount,
            reference,
            status: "pending",
            merchantId: merchant.id,
            metadata: {
                isMerchantDeposit: true,
            },
        });
        // If payment method is paynow, initiate paynow payment
        if (paymentMethod === "paynow") {
            const paymentResult = await paynow_service_1.default.initiateTransaction(merchantUser.email || `${merchantUser.studentId}@cutcoin.ac.zw`, // Email
            merchantUser.phoneNumber || "", // Phone number
            amount, reference, `Merchant float deposit: ${cutcoinAmount} CUTcoins` // Description
            );
            if (paymentResult.status !== "success") {
                // Update payment status to failed
                await payment.update({
                    status: "failed",
                    metadata: { ...payment.metadata, error: paymentResult.error },
                });
                throw new HttpException_1.HttpException(500, paymentResult.error || "Payment initialization failed");
            }
            // Update payment with Paynow details
            await payment.update({
                metadata: {
                    ...payment.metadata,
                    pollUrl: paymentResult.pollUrl,
                    redirectUrl: paymentResult.redirectUrl,
                },
            });
            return {
                paymentId: payment.id,
                reference: payment.reference,
                amount,
                cutcoinAmount,
                redirectUrl: paymentResult.redirectUrl,
                pollUrl: paymentResult.pollUrl,
                message: "Paynow payment initiated successfully. Please complete the payment.",
            };
        }
        else if (paymentMethod === "cash") {
            // For cash deposits, admin needs to approve
            return {
                paymentId: payment.id,
                reference: payment.reference,
                amount,
                cutcoinAmount,
                message: "Cash deposit request submitted. Waiting for admin approval.",
            };
        }
        throw new HttpException_1.HttpException(400, "Invalid payment method");
    }
    // Admin approves merchant cash deposit
    async adminApproveMerchantDeposit(adminId, paymentId) {
        var _a;
        // Find payment
        const payment = await payment_model_1.Payment.findByPk(paymentId, {
            include: [{ model: user_model_1.User }],
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment not found");
        }
        if (payment.status !== "pending") {
            throw new HttpException_1.HttpException(400, `Payment already ${payment.status}`);
        }
        // Verify this is a merchant deposit
        if (!((_a = payment.metadata) === null || _a === void 0 ? void 0 : _a.isMerchantDeposit)) {
            throw new HttpException_1.HttpException(400, "This is not a merchant deposit");
        }
        // Process in transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Find merchant wallet
            const wallet = await wallet_model_1.Wallet.findOne({
                where: { userId: payment.userId },
                transaction: t,
            });
            if (!wallet) {
                throw new HttpException_1.HttpException(404, "Wallet not found");
            }
            // Update wallet balance
            wallet.balance = Number(wallet.balance) + Number(payment.cutcoinAmount);
            await wallet.save({ transaction: t });
            // Create transaction record
            const transaction = await transaction_model_1.Transaction.create({
                senderId: payment.userId, // Self-deposit
                receiverId: payment.userId,
                amount: payment.cutcoinAmount,
                type: "deposit",
                status: "completed",
                reference: payment.reference,
                description: `Merchant float deposit via ${payment.paymentMethod}`,
                fee: 0,
            }, { transaction: t });
            // Update payment status
            payment.status = "completed";
            await payment.save({ transaction: t });
            return { wallet, transaction, payment };
        });
        // Find merchant
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId: payment.userId },
        });
        // Send notification
        await this.notificationService.sendSMS({
            userId: payment.userId,
            message: `Your merchant float deposit of ${payment.cutcoinAmount} CUTcoins has been processed. New balance: ${result.wallet.balance} CUTcoins.`,
        });
        return {
            success: true,
            message: "Merchant deposit approved successfully",
            merchantName: merchant ? merchant.name : "Unknown",
            amount: payment.cutcoinAmount,
            transaction: result.transaction,
        };
    }
    // Merchant initiates cash deposit for student
    async initiateCashDeposit(merchantId, data) {
        const { studentId, cashAmount, notes } = data;
        // Validate amount
        if (cashAmount <= 0) {
            throw new HttpException_1.HttpException(400, "Amount must be greater than zero");
        }
        // Find merchant
        const merchant = await merchant_model_1.Merchant.findByPk(merchantId);
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found");
        }
        // Check if merchant is approved
        if (merchant.status !== "approved") {
            throw new HttpException_1.HttpException(403, "Merchant is not approved to accept deposits");
        }
        // Find student
        const student = await user_model_1.User.findOne({
            where: { studentId },
        });
        if (!student) {
            throw new HttpException_1.HttpException(404, "Student not found");
        }
        // Calculate CUTcoin amount
        const cutcoinAmount = await this.calculateCutcoinAmount(cashAmount);
        // Generate reference
        const reference = (0, generators_1.generateTransactionReference)();
        // Create merchant deposit record
        const deposit = await merchant_deposit_model_1.MerchantDeposit.create({
            merchantId,
            studentId: student.id,
            cashAmount,
            cutcoinAmount,
            reference,
            status: "pending",
            notes: notes || "",
        });
        // Create payment record
        await payment_model_1.Payment.create({
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
        });
        // Send notification to student
        await this.notificationService.sendSMS({
            userId: student.id,
            message: `A cash deposit of ${cashAmount} (${cutcoinAmount} CUTcoins) has been initiated by merchant ${merchant.name}. Reference: ${reference}`,
        });
        return {
            depositId: deposit.id,
            reference,
            studentId: student.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            cashAmount,
            cutcoinAmount,
            status: deposit.status,
        };
    }
    // Student confirms cash deposit
    async confirmCashDeposit(studentId, reference) {
        // Find deposit
        const deposit = await merchant_deposit_model_1.MerchantDeposit.findOne({
            where: { reference, studentId },
            include: [{ model: merchant_model_1.Merchant }],
        });
        if (!deposit) {
            throw new HttpException_1.HttpException(404, "Deposit not found");
        }
        if (deposit.status !== "pending") {
            throw new HttpException_1.HttpException(400, `Deposit already ${deposit.status}`);
        }
        // Update deposit status
        deposit.status = "approved";
        await deposit.save();
        // Find payment
        const payment = await payment_model_1.Payment.findOne({
            where: { reference, userId: studentId },
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment record not found");
        }
        // Process the payment
        const result = await this.processPayment(payment.id);
        // Send notification to merchant
        await this.notificationService.sendSMS({
            userId: deposit.merchant.userId,
            message: `Cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) has been confirmed by student. Reference: ${reference}`,
        });
        return {
            success: true,
            message: "Cash deposit confirmed successfully",
            transaction: result.transaction,
        };
    }
    // Admin approves merchant deposit (alternative flow)
    async adminApproveCashDeposit(adminId, depositId) {
        // Find deposit
        const deposit = await merchant_deposit_model_1.MerchantDeposit.findByPk(depositId, {
            include: [{ model: merchant_model_1.Merchant }, { model: user_model_1.User, as: "student" }],
        });
        if (!deposit) {
            throw new HttpException_1.HttpException(404, "Deposit not found");
        }
        if (deposit.status !== "pending") {
            throw new HttpException_1.HttpException(400, `Deposit already ${deposit.status}`);
        }
        // Update deposit status
        deposit.status = "approved";
        deposit.approvedBy = adminId;
        deposit.approvedAt = new Date();
        await deposit.save();
        // Find payment
        const payment = await payment_model_1.Payment.findOne({
            where: { reference: deposit.reference },
        });
        if (!payment) {
            throw new HttpException_1.HttpException(404, "Payment record not found");
        }
        // Process the payment
        const result = await this.processPayment(payment.id);
        // Send notifications
        await this.notificationService.sendSMS({
            userId: deposit.studentId,
            message: `Your cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) has been approved. New balance: ${result.wallet.balance} CUTcoins.`,
        });
        await this.notificationService.sendSMS({
            userId: deposit.merchant.userId,
            message: `Cash deposit of ${deposit.cashAmount} (${deposit.cutcoinAmount} CUTcoins) for student ${deposit.student.firstName} ${deposit.student.lastName} has been approved by admin.`,
        });
        return {
            success: true,
            message: "Cash deposit approved successfully",
            transaction: result.transaction,
        };
    }
    // Get merchant deposits
    async getMerchantDeposits(merchantId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            merchantId,
        };
        if (query.status) {
            whereClause.status = query.status;
        }
        const { count, rows } = await payment_model_1.Payment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    as: "user", // Changed from "student" to "user" to match the association defined in Payment model
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        return {
            deposits: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    // Get student deposits
    async getStudentDeposits(studentId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            userId: studentId,
        };
        if (query.status) {
            whereClause.status = query.status;
        }
        const { count, rows } = await payment_model_1.Payment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        return {
            deposits: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    // Get merchant deposit details
    async getMerchantDepositDetails(merchantId, depositId) {
        const deposit = await payment_model_1.Payment.findOne({
            where: {
                id: depositId,
                merchantId,
            },
            include: [
                {
                    model: user_model_1.User,
                    as: "user", // Changed from "student" to "user" to match the association defined in Payment model
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        if (!deposit) {
            throw new HttpException_1.HttpException(404, "Deposit not found");
        }
        return deposit;
    }
    // Admin methods for regulating token purchases
    // Get all payments for admin
    async getAllPayments(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (query.status) {
            whereClause.status = query.status;
        }
        if (query.method) {
            whereClause.paymentMethod = query.method;
        }
        const { count, rows } = await payment_model_1.Payment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        return {
            payments: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    // Get all merchant deposits for admin
    async getAllMerchantDeposits(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (query.status) {
            whereClause.status = query.status;
        }
        const { count, rows } = await merchant_deposit_model_1.MerchantDeposit.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: merchant_model_1.Merchant,
                    attributes: ["id", "name", "location"],
                },
                {
                    model: user_model_1.User,
                    as: "student",
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        return {
            deposits: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    // Update system exchange rate
    async updateExchangeRate(adminId, newRate) {
        if (newRate <= 0) {
            throw new HttpException_1.HttpException(400, "Exchange rate must be greater than zero");
        }
        const config = await system_config_model_1.SystemConfig.findOne({
            where: { key: "exchange_rate" },
        });
        if (!config) {
            // Create new config
            await system_config_model_1.SystemConfig.create({
                key: "exchange_rate",
                value: newRate.toString(),
                description: "Exchange rate: 1 USD = X CUTcoins",
                isActive: true,
            });
        }
        else {
            // Update existing config
            await config.update({
                value: newRate.toString(),
            });
        }
        return {
            success: true,
            message: "Exchange rate updated successfully",
            newRate,
        };
    }
    // Set merchant deposit limits
    async setMerchantDepositLimits(adminId, limits) {
        if (limits.daily <= 0 || limits.monthly <= 0) {
            throw new HttpException_1.HttpException(400, "Limits must be greater than zero");
        }
        if (limits.daily > limits.monthly) {
            throw new HttpException_1.HttpException(400, "Daily limit cannot be greater than monthly limit");
        }
        // Update daily limit
        const dailyConfig = await system_config_model_1.SystemConfig.findOne({
            where: { key: "merchant_daily_deposit_limit" },
        });
        if (!dailyConfig) {
            await system_config_model_1.SystemConfig.create({
                key: "merchant_daily_deposit_limit",
                value: limits.daily.toString(),
                description: "Maximum daily deposit limit for merchants in USD",
                isActive: true,
            });
        }
        else {
            await dailyConfig.update({
                value: limits.daily.toString(),
            });
        }
        // Update monthly limit
        const monthlyConfig = await system_config_model_1.SystemConfig.findOne({
            where: { key: "merchant_monthly_deposit_limit" },
        });
        if (!monthlyConfig) {
            await system_config_model_1.SystemConfig.create({
                key: "merchant_monthly_deposit_limit",
                value: limits.monthly.toString(),
                description: "Maximum monthly deposit limit for merchants in USD",
                isActive: true,
            });
        }
        else {
            await monthlyConfig.update({
                value: limits.monthly.toString(),
            });
        }
        return {
            success: true,
            message: "Merchant deposit limits updated successfully",
            limits,
        };
    }
    // Check if merchant is within deposit limits
    async checkMerchantDepositLimits(merchantId, amount) {
        // Get limits from config
        const dailyLimitConfig = await system_config_model_1.SystemConfig.findOne({
            where: { key: "merchant_daily_deposit_limit", isActive: true },
        });
        const monthlyLimitConfig = await system_config_model_1.SystemConfig.findOne({
            where: { key: "merchant_monthly_deposit_limit", isActive: true },
        });
        const dailyLimit = dailyLimitConfig ? Number.parseFloat(dailyLimitConfig.value) : 1000; // Default 1000 USD
        const monthlyLimit = monthlyLimitConfig ? Number.parseFloat(monthlyLimitConfig.value) : 10000; // Default 10000 USD
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Get first day of current month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // Calculate daily deposits
        const dailyDeposits = await payment_model_1.Payment.sum("amount", {
            where: {
                merchantId,
                paymentMethod: "cash",
                createdAt: {
                    [sequelize_2.Op.gte]: today,
                },
                status: {
                    [sequelize_2.Op.in]: ["pending", "completed"],
                },
            },
        });
        // Calculate monthly deposits
        const monthlyDeposits = await payment_model_1.Payment.sum("amount", {
            where: {
                merchantId,
                paymentMethod: "cash",
                createdAt: {
                    [sequelize_2.Op.gte]: firstDayOfMonth,
                },
                status: {
                    [sequelize_2.Op.in]: ["pending", "completed"],
                },
            },
        });
        // Check if new amount would exceed limits
        const newDailyTotal = (dailyDeposits || 0) + amount;
        const newMonthlyTotal = (monthlyDeposits || 0) + amount;
        return newDailyTotal <= dailyLimit && newMonthlyTotal <= monthlyLimit;
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map