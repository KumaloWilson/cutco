"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantService = void 0;
const user_model_1 = require("../models/user.model");
const wallet_model_1 = require("../models/wallet.model");
const transaction_model_1 = require("../models/transaction.model");
const merchant_model_1 = require("../models/merchant.model");
const otp_model_1 = require("../models/otp.model");
const HttpException_1 = require("../exceptions/HttpException");
const generators_1 = require("../utils/generators");
const sms_1 = require("../utils/sms");
const sequelize_1 = __importDefault(require("../config/sequelize"));
class MerchantService {
    async registerMerchant(userId, merchantData) {
        // Check if user already has a merchant account
        const existingMerchant = await merchant_model_1.Merchant.findOne({ where: { userId } });
        if (existingMerchant) {
            throw new HttpException_1.HttpException(409, "User already has a merchant account");
        }
        // Create merchant account
        const merchant = await merchant_model_1.Merchant.create({
            userId,
            name: merchantData.name,
            location: merchantData.location,
            description: merchantData.description,
            contactPerson: merchantData.contactPerson,
            contactPhone: merchantData.contactPhone,
            status: "pending",
        });
        return {
            message: "Merchant registration successful. Pending approval.",
            merchantId: merchant.id,
            merchantNumber: merchant.merchantNumber,
        };
    }
    async getMerchantProfile(userId) {
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant profile not found");
        }
        return merchant;
    }
    async getMerchantByNumber(merchantNumber) {
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { merchantNumber, status: "approved", isActive: true },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        return merchant;
    }
    async updateMerchantProfile(userId, merchantData) {
        const merchant = await merchant_model_1.Merchant.findOne({ where: { userId } });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant profile not found");
        }
        // Update merchant data
        await merchant.update(merchantData);
        return {
            message: "Merchant profile updated successfully",
            merchant,
        };
    }
    async initiatePayment(merchantId, paymentData) {
        const { customerStudentId, amount, description } = paymentData;
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Payment amount must be greater than zero");
        }
        // Find merchant
        const merchant = await merchant_model_1.Merchant.findByPk(merchantId);
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found");
        }
        // Check if merchant is approved
        if (merchant.status !== "approved") {
            throw new HttpException_1.HttpException(403, "Merchant account is not approved");
        }
        // Find customer by student ID
        const customer = await user_model_1.User.findOne({
            where: { studentId: customerStudentId },
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!customer || !customer.wallet) {
            throw new HttpException_1.HttpException(404, "Customer not found");
        }
        // Check if customer wallet has sufficient balance
        if (Number(customer.wallet.balance) < amount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance");
        }
        // Generate OTP for payment verification
        const otpCode = (0, generators_1.generateOTP)();
        await otp_model_1.OTP.create({
            userId: customer.id,
            phoneNumber: customer.phoneNumber,
            code: otpCode,
            purpose: "transaction",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        // Send OTP via SMS
        await (0, sms_1.sendSMS)(customer.phoneNumber, `Your CUTcoin payment verification code is: ${otpCode}. Amount: ${amount} CUTcoins to ${merchant.name} (${merchant.merchantNumber}). Valid for 10 minutes.`);
        return {
            message: "OTP sent for payment verification",
            paymentDetails: {
                merchantName: merchant.name,
                merchantNumber: merchant.merchantNumber,
                amount,
                description,
            },
        };
    }
    async confirmPayment(data) {
        const { merchantNumber, customerStudentId, amount, code, description } = data;
        // Find merchant by merchant number
        const merchant = await this.getMerchantByNumber(merchantNumber);
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        // Find customer by student ID
        const customer = await user_model_1.User.findOne({
            where: { studentId: customerStudentId },
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!customer || !customer.wallet) {
            throw new HttpException_1.HttpException(404, "Customer not found");
        }
        // Verify OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                userId: customer.id,
                code,
                purpose: "transaction",
                isUsed: false,
                expiresAt: { $gt: new Date() },
            },
        });
        if (!otp) {
            throw new HttpException_1.HttpException(400, "Invalid or expired OTP");
        }
        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();
        // Find merchant user and wallet
        const merchantUser = await user_model_1.User.findByPk(merchant.userId, {
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!merchantUser || !merchantUser.wallet) {
            throw new HttpException_1.HttpException(404, "Merchant wallet not found");
        }
        // Check if customer wallet has sufficient balance
        if (Number(customer.wallet.balance) < amount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance");
        }
        // Process payment in a transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Update customer wallet balance
            customer.wallet.balance = Number(customer.wallet.balance) - amount;
            await customer.wallet.save({ transaction: t });
            // Update merchant wallet balance
            merchantUser.wallet.balance = Number(merchantUser.wallet.balance) + amount;
            await merchantUser.wallet.save({ transaction: t });
            // Create transaction record
            const reference = (0, generators_1.generateTransactionReference)();
            const transaction = await transaction_model_1.Transaction.create({
                senderId: customer.id,
                receiverId: merchantUser.id,
                amount,
                type: "payment",
                status: "completed",
                reference,
                description: `Payment to ${merchant.name} (${merchant.merchantNumber}): ${description}`,
                fee: 0,
            }, { transaction: t });
            return { customerWallet: customer.wallet, transaction };
        });
        // Send SMS notifications
        await (0, sms_1.sendSMS)(customer.phoneNumber, `Your payment of ${amount} CUTcoins to ${merchant.name} (${merchant.merchantNumber}) was successful. New balance: ${result.customerWallet.balance} CUTcoins.`);
        await (0, sms_1.sendSMS)(merchantUser.phoneNumber, `You have received a payment of ${amount} CUTcoins from ${customer.firstName} ${customer.lastName}. Reference: ${result.transaction.reference}`);
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
        };
    }
    async getMerchantTransactions(merchantId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        // Find merchant
        const merchant = await merchant_model_1.Merchant.findByPk(merchantId);
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found");
        }
        // Find merchant user
        const merchantUser = await user_model_1.User.findByPk(merchant.userId);
        if (!merchantUser) {
            throw new HttpException_1.HttpException(404, "Merchant user not found");
        }
        const whereClause = {
            receiverId: merchantUser.id,
            type: "payment",
        };
        if (query.status) {
            whereClause.status = query.status;
        }
        const { count, rows } = await transaction_model_1.Transaction.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    as: "sender",
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
                customer: transaction.sender
                    ? {
                        studentId: transaction.sender.studentId,
                        name: `${transaction.sender.firstName} ${transaction.sender.lastName}`,
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
exports.MerchantService = MerchantService;
//# sourceMappingURL=merchant.service.js.map