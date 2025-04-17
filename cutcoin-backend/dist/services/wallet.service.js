"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const user_model_1 = require("../models/user.model");
const wallet_model_1 = require("../models/wallet.model");
const transaction_model_1 = require("../models/transaction.model");
const otp_model_1 = require("../models/otp.model");
const merchant_model_1 = require("../models/merchant.model");
const merchant_transaction_model_1 = require("../models/merchant-transaction.model");
const HttpException_1 = require("../exceptions/HttpException");
const generators_1 = require("../utils/generators");
const sms_1 = require("../utils/sms");
const sequelize_1 = __importDefault(require("../config/sequelize"));
const sequelize_2 = require("sequelize");
class WalletService {
    async getWalletBalance(userId) {
        const wallet = await wallet_model_1.Wallet.findOne({
            where: { userId },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        if (!wallet) {
            throw new HttpException_1.HttpException(404, "Wallet not found");
        }
        return {
            walletAddress: wallet.walletAddress,
            balance: wallet.balance,
            user: wallet.user,
        };
    }
    async initiateDeposit(userId, data) {
        const { amount, merchantNumber } = data;
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Deposit amount must be greater than zero");
        }
        // Find merchant by merchant number
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
        // Find user
        const user = await user_model_1.User.findByPk(userId, {
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Generate a unique reference
        const reference = (0, generators_1.generateTransactionReference)();
        // Create a pending merchant transaction
        const merchantTransaction = await merchant_transaction_model_1.MerchantTransaction.create({
            userId,
            merchantId: merchant.id,
            type: "deposit",
            amount,
            reference,
            status: "pending",
            studentConfirmed: true, // Student initiates, so automatically confirmed
            merchantConfirmed: false,
            description: `Deposit via merchant ${merchant.name} (${merchant.merchantNumber})`,
        });
        // Send notification to merchant
        await (0, sms_1.sendSMS)(merchant.user.phoneNumber, `A deposit request of ${amount} CUTcoins has been initiated by ${user.firstName} ${user.lastName} (${user.studentId}). Reference: ${reference}. Please confirm the cash receipt.`);
        // Send confirmation to student
        await (0, sms_1.sendSMS)(user.phoneNumber, `Your deposit request of ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}) has been initiated. Reference: ${reference}. Please wait for merchant confirmation.`);
        return {
            message: "Deposit request initiated successfully. Waiting for merchant confirmation.",
            reference,
            amount,
            merchantName: merchant.name,
            merchantNumber: merchant.merchantNumber,
            status: "pending",
        };
    }
    async merchantConfirmDeposit(merchantUserId, data) {
        const { reference } = data;
        // Find the merchant
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId: merchantUserId, status: "approved", isActive: true },
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        // Find the merchant transaction
        const merchantTransaction = await merchant_transaction_model_1.MerchantTransaction.findOne({
            where: {
                reference,
                merchantId: merchant.id,
                type: "deposit",
                status: "pending",
            },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                    include: [{ model: wallet_model_1.Wallet }],
                },
            ],
        });
        if (!merchantTransaction) {
            throw new HttpException_1.HttpException(404, "Deposit transaction not found or already processed");
        }
        // Find merchant's wallet
        const merchantWallet = await wallet_model_1.Wallet.findOne({
            where: { userId: merchantUserId },
        });
        if (!merchantWallet) {
            throw new HttpException_1.HttpException(404, "Merchant wallet not found");
        }
        // Check if merchant has sufficient balance
        if (Number(merchantWallet.balance) < Number(merchantTransaction.amount)) {
            throw new HttpException_1.HttpException(400, "Insufficient merchant balance to complete this deposit");
        }
        // Process the deposit in a transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Update merchant transaction status
            merchantTransaction.merchantConfirmed = true;
            merchantTransaction.status = "completed";
            merchantTransaction.completedAt = new Date();
            await merchantTransaction.save({ transaction: t });
            // Update user wallet balance (add to student)
            const wallet = merchantTransaction.user.wallet;
            wallet.balance = Number(wallet.balance) + Number(merchantTransaction.amount);
            await wallet.save({ transaction: t });
            // Update merchant wallet balance (subtract from merchant)
            merchantWallet.balance = Number(merchantWallet.balance) - Number(merchantTransaction.amount);
            await merchantWallet.save({ transaction: t });
            // Create transaction record
            const transaction = await transaction_model_1.Transaction.create({
                senderId: merchantUserId, // Merchant is the sender in a deposit
                receiverId: merchantTransaction.userId, // Student is the receiver
                amount: merchantTransaction.amount,
                type: "deposit",
                status: "completed",
                reference: merchantTransaction.reference,
                description: merchantTransaction.description,
                fee: 0,
            }, { transaction: t });
            return { wallet, merchantWallet, transaction, merchantTransaction };
        });
        // Send notifications
        await (0, sms_1.sendSMS)(merchantTransaction.user.phoneNumber, `Your deposit of ${merchantTransaction.amount} CUTcoins has been confirmed by merchant ${merchant.name}. New balance: ${result.wallet.balance} CUTcoins.`);
        // Notify merchant of their new balance
        await (0, sms_1.sendSMS)(merchant.user.phoneNumber, `You have confirmed a deposit of ${merchantTransaction.amount} CUTcoins to ${merchantTransaction.user.firstName} ${merchantTransaction.user.lastName}. Your new balance: ${result.merchantWallet.balance} CUTcoins.`);
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
        };
    }
    async initiateWithdrawal(userId, data) {
        const { amount, merchantNumber } = data;
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Withdrawal amount must be greater than zero");
        }
        // Find merchant by merchant number
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
        // Find user with wallet
        const user = await user_model_1.User.findByPk(userId, {
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!user || !user.wallet) {
            throw new HttpException_1.HttpException(404, "User wallet not found");
        }
        // Calculate fee (1% for withdrawals above 2000 CUTcoins)
        const fee = amount > 2000 ? amount * 0.01 : 0;
        const totalAmount = amount + fee;
        // Check if wallet has sufficient balance
        if (Number(user.wallet.balance) < totalAmount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance including fees");
        }
        // Generate OTP for withdrawal verification
        const otpCode = (0, generators_1.generateOTP)();
        await otp_model_1.OTP.create({
            userId,
            phoneNumber: user.phoneNumber,
            code: otpCode,
            purpose: "withdrawal",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        // Send OTP via SMS
        await (0, sms_1.sendSMS)(user.phoneNumber, `Your CUTcoin withdrawal verification code is: ${otpCode}. Amount: ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}). Fee: ${fee} CUTcoins. Valid for 10 minutes.`);
        return {
            message: "OTP sent for withdrawal verification",
            amount,
            fee,
            totalAmount,
            merchantName: merchant.name,
            merchantNumber: merchant.merchantNumber,
        };
    }
    async confirmWithdrawalOTP(userId, data) {
        const { amount, merchantNumber, code } = data;
        // Verify OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                userId,
                code,
                purpose: "withdrawal",
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
        // Find merchant by merchant number
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
        // Find user with wallet
        const user = await user_model_1.User.findByPk(userId, {
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!user || !user.wallet) {
            throw new HttpException_1.HttpException(404, "User wallet not found");
        }
        // Calculate fee (1% for withdrawals above 2000 CUTcoins)
        const fee = amount > 2000 ? amount * 0.01 : 0;
        const totalAmount = amount + fee;
        // Check if wallet has sufficient balance
        if (Number(user.wallet.balance) < totalAmount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance including fees");
        }
        // Generate a unique reference
        const reference = (0, generators_1.generateTransactionReference)();
        // Create a pending merchant transaction
        const merchantTransaction = await merchant_transaction_model_1.MerchantTransaction.create({
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
        });
        // Deduct the amount from the user's wallet immediately to prevent double spending
        await sequelize_1.default.transaction(async (t) => {
            user.wallet.balance = Number(user.wallet.balance) - totalAmount;
            await user.wallet.save({ transaction: t });
        });
        // Send notification to merchant
        await (0, sms_1.sendSMS)(merchant.user.phoneNumber, `A withdrawal request of ${amount} CUTcoins has been initiated by ${user.firstName} ${user.lastName} (${user.studentId}). Reference: ${reference}. Please provide the cash and confirm.`);
        // Send confirmation to student
        await (0, sms_1.sendSMS)(user.phoneNumber, `Your withdrawal request of ${amount} CUTcoins via merchant ${merchant.name} (${merchant.merchantNumber}) has been initiated. Reference: ${reference}. Please collect your cash from the merchant.`);
        return {
            message: "Withdrawal request initiated successfully. Waiting for merchant confirmation.",
            reference,
            amount,
            fee,
            totalAmount,
            merchantName: merchant.name,
            merchantNumber: merchant.merchantNumber,
            status: "pending",
        };
    }
    async merchantConfirmWithdrawal(merchantUserId, data) {
        const { reference } = data;
        // Find the merchant
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId: merchantUserId, status: "approved", isActive: true },
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        // Find the merchant transaction
        const merchantTransaction = await merchant_transaction_model_1.MerchantTransaction.findOne({
            where: {
                reference,
                merchantId: merchant.id,
                type: "withdrawal",
                status: "pending",
            },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        if (!merchantTransaction) {
            throw new HttpException_1.HttpException(404, "Withdrawal transaction not found or already processed");
        }
        // Find merchant's wallet
        const merchantWallet = await wallet_model_1.Wallet.findOne({
            where: { userId: merchantUserId },
        });
        if (!merchantWallet) {
            throw new HttpException_1.HttpException(404, "Merchant wallet not found");
        }
        // Process the withdrawal in a transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Update merchant transaction status
            merchantTransaction.merchantConfirmed = true;
            merchantTransaction.status = "completed";
            merchantTransaction.completedAt = new Date();
            await merchantTransaction.save({ transaction: t });
            // Update merchant wallet balance (add to merchant)
            merchantWallet.balance = Number(merchantWallet.balance) + Number(merchantTransaction.amount);
            await merchantWallet.save({ transaction: t });
            // Create transaction record
            const transaction = await transaction_model_1.Transaction.create({
                senderId: merchantTransaction.userId, // Student is the sender
                receiverId: merchantUserId, // Merchant is the receiver
                amount: merchantTransaction.amount,
                type: "withdrawal",
                status: "completed",
                reference: merchantTransaction.reference,
                description: merchantTransaction.description,
                fee: merchantTransaction.fee || 0,
            }, { transaction: t });
            return { merchantWallet, transaction, merchantTransaction };
        });
        // Send notifications
        await (0, sms_1.sendSMS)(merchantTransaction.user.phoneNumber, `Your withdrawal of ${merchantTransaction.amount} CUTcoins has been confirmed by merchant ${merchant.name}. Fee: ${merchantTransaction.fee || 0} CUTcoins.`);
        // Notify merchant of their new balance
        await (0, sms_1.sendSMS)(merchant.user.phoneNumber, `You have confirmed a withdrawal of ${merchantTransaction.amount} CUTcoins from ${merchantTransaction.user.firstName} ${merchantTransaction.user.lastName}. Your new balance: ${result.merchantWallet.balance} CUTcoins.`);
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
        };
    }
    async cancelMerchantTransaction(userId, data) {
        const { reference } = data;
        // Find the merchant transaction
        const merchantTransaction = await merchant_transaction_model_1.MerchantTransaction.findOne({
            where: {
                reference,
                userId,
                status: "pending",
            },
            include: [
                {
                    model: merchant_model_1.Merchant,
                    include: [
                        {
                            model: user_model_1.User,
                            attributes: ["phoneNumber", "id"],
                        },
                    ],
                },
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                    include: [{ model: wallet_model_1.Wallet }],
                },
            ],
        });
        if (!merchantTransaction) {
            throw new HttpException_1.HttpException(404, "Transaction not found or already processed");
        }
        // Process the cancellation in a transaction
        await sequelize_1.default.transaction(async (t) => {
            // If it's a withdrawal, refund the amount to the user's wallet
            if (merchantTransaction.type === "withdrawal") {
                const totalAmount = Number(merchantTransaction.amount) + Number(merchantTransaction.fee || 0);
                merchantTransaction.user.wallet.balance = Number(merchantTransaction.user.wallet.balance) + totalAmount;
                await merchantTransaction.user.wallet.save({ transaction: t });
            }
            // Update merchant transaction status
            merchantTransaction.status = "cancelled";
            merchantTransaction.cancelledAt = new Date();
            await merchantTransaction.save({ transaction: t });
        });
        // Send notifications
        await (0, sms_1.sendSMS)(merchantTransaction.user.phoneNumber, `Your ${merchantTransaction.type} of ${merchantTransaction.amount} CUTcoins via merchant ${merchantTransaction.merchant.name} has been cancelled.`);
        await (0, sms_1.sendSMS)(merchantTransaction.merchant.user.phoneNumber, `A ${merchantTransaction.type} request of ${merchantTransaction.amount} CUTcoins by ${merchantTransaction.user.firstName} ${merchantTransaction.user.lastName} has been cancelled.`);
        return {
            message: `${merchantTransaction.type.charAt(0).toUpperCase() + merchantTransaction.type.slice(1)} cancelled successfully`,
            reference: merchantTransaction.reference,
        };
    }
    async getMerchantPendingTransactions(merchantUserId) {
        // Find the merchant
        const merchant = await merchant_model_1.Merchant.findOne({
            where: { userId: merchantUserId, status: "approved", isActive: true },
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found or not active");
        }
        // Find pending transactions
        const pendingTransactions = await merchant_transaction_model_1.MerchantTransaction.findAll({
            where: {
                merchantId: merchant.id,
                status: "pending",
            },
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
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
        };
    }
    async getUserPendingTransactions(userId) {
        // Find pending transactions
        const pendingTransactions = await merchant_transaction_model_1.MerchantTransaction.findAll({
            where: {
                userId,
                status: "pending",
            },
            include: [
                {
                    model: merchant_model_1.Merchant,
                    attributes: ["id", "name", "merchantNumber", "location"],
                    include: [
                        {
                            model: user_model_1.User,
                            attributes: ["phoneNumber"],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
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
        };
    }
    async transfer(userId, data) {
        const { recipientId, amount } = data;
        if (amount <= 0) {
            throw new HttpException_1.HttpException(400, "Transfer amount must be greater than zero");
        }
        // Find sender wallet
        const senderWallet = await wallet_model_1.Wallet.findOne({ where: { userId } });
        if (!senderWallet) {
            throw new HttpException_1.HttpException(404, "Sender wallet not found");
        }
        // Find recipient user by student ID
        const recipientUser = await user_model_1.User.findOne({
            where: { studentId: recipientId },
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!recipientUser || !recipientUser.wallet) {
            throw new HttpException_1.HttpException(404, "Recipient not found");
        }
        // Prevent self-transfers
        if (userId === recipientUser.id) {
            throw new HttpException_1.HttpException(400, "Cannot transfer to yourself");
        }
        // Calculate fee (0.5% for transfers above 1000 CUTcoins)
        const fee = amount > 1000 ? amount * 0.005 : 0;
        const totalAmount = amount + fee;
        // Check if sender wallet has sufficient balance
        if (Number(senderWallet.balance) < totalAmount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance including fees");
        }
        // Generate OTP for transfer verification
        const sender = await user_model_1.User.findByPk(userId);
        if (!sender) {
            throw new HttpException_1.HttpException(404, "Sender not found");
        }
        const otpCode = (0, generators_1.generateOTP)();
        await otp_model_1.OTP.create({
            userId,
            phoneNumber: sender.phoneNumber,
            code: otpCode,
            purpose: "transfer",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        // Send OTP via SMS
        await (0, sms_1.sendSMS)(sender.phoneNumber, `Your CUTcoin transfer verification code is: ${otpCode}. Amount: ${amount} CUTcoins to ${recipientUser.firstName} ${recipientUser.lastName} (${recipientUser.studentId}). Valid for 10 minutes.`);
        return {
            message: "OTP sent for transfer verification",
            recipient: {
                studentId: recipientUser.studentId,
                name: `${recipientUser.firstName} ${recipientUser.lastName}`,
            },
            amount,
            fee,
            totalAmount,
        };
    }
    async confirmTransfer(userId, data) {
        const { recipientId, amount, code } = data;
        // Verify OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                userId,
                code,
                purpose: "transfer",
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
        // Find sender wallet
        const senderWallet = await wallet_model_1.Wallet.findOne({ where: { userId } });
        if (!senderWallet) {
            throw new HttpException_1.HttpException(404, "Sender wallet not found");
        }
        // Find recipient user by student ID
        const recipientUser = await user_model_1.User.findOne({
            where: { studentId: recipientId },
            include: [{ model: wallet_model_1.Wallet }],
        });
        if (!recipientUser || !recipientUser.wallet) {
            throw new HttpException_1.HttpException(404, "Recipient not found");
        }
        // Prevent self-transfers
        if (userId === recipientUser.id) {
            throw new HttpException_1.HttpException(400, "Cannot transfer to yourself");
        }
        // Calculate fee (0.5% for transfers above 1000 CUTcoins)
        const fee = amount > 1000 ? amount * 0.005 : 0;
        const totalAmount = amount + fee;
        // Check if sender wallet has sufficient balance
        if (Number(senderWallet.balance) < totalAmount) {
            throw new HttpException_1.HttpException(400, "Insufficient balance including fees");
        }
        // Check for suspicious activity
        await this.checkForSuspiciousActivity(userId, recipientUser.id, amount);
        // Process transfer in a transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Update sender wallet balance
            senderWallet.balance = Number(senderWallet.balance) - totalAmount;
            await senderWallet.save({ transaction: t });
            // Update recipient wallet balance
            recipientUser.wallet.balance = Number(recipientUser.wallet.balance) + amount;
            await recipientUser.wallet.save({ transaction: t });
            // Create transaction record
            const reference = (0, generators_1.generateTransactionReference)();
            const transaction = await transaction_model_1.Transaction.create({
                senderId: userId,
                receiverId: recipientUser.id,
                amount,
                type: "transfer",
                status: "completed",
                reference,
                description: `Transfer to ${recipientUser.firstName} ${recipientUser.lastName} (${recipientUser.studentId})`,
                fee,
            }, { transaction: t });
            return { senderWallet, transaction };
        });
        // Send SMS notifications
        const sender = await user_model_1.User.findByPk(userId);
        if (sender) {
            await (0, sms_1.sendSMS)(sender.phoneNumber, `Your transfer of ${amount} CUTcoins to ${recipientUser.firstName} ${recipientUser.lastName} was successful. Fee: ${fee} CUTcoins. New balance: ${result.senderWallet.balance} CUTcoins.`);
        }
        await (0, sms_1.sendSMS)(recipientUser.phoneNumber, `You have received ${amount} CUTcoins from ${sender === null || sender === void 0 ? void 0 : sender.firstName} ${sender === null || sender === void 0 ? void 0 : sender.lastName}. New balance: ${recipientUser.wallet.balance} CUTcoins.`);
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
        };
    }
    async checkForSuspiciousActivity(senderId, receiverId, amount) {
        // Check for unusual transaction amount
        const userAvgTransaction = (await transaction_model_1.Transaction.findOne({
            attributes: [[sequelize_1.default.fn("AVG", sequelize_1.default.col("amount")), "avgAmount"]],
            where: {
                senderId,
                type: "transfer",
                status: "completed",
            },
            raw: true,
        }));
        const avgAmount = (userAvgTransaction === null || userAvgTransaction === void 0 ? void 0 : userAvgTransaction.avgAmount) ? Number(userAvgTransaction.avgAmount) : 0;
        // If this transaction is significantly larger than average (3x) and above 5000
        if (avgAmount > 0 && amount > avgAmount * 3 && amount > 5000) {
            // Log suspicious activity
            console.warn(`Suspicious transfer detected: User ${senderId} transferring ${amount} to ${receiverId}, avg is ${avgAmount}`);
            // Could implement additional verification here if needed
            // For now, we'll just let it proceed with the existing OTP verification
        }
        // Check for multiple transfers to the same recipient in a short time
        const recentTransfers = await transaction_model_1.Transaction.count({
            where: {
                senderId,
                receiverId,
                type: "transfer",
                status: "completed",
                createdAt: {
                    [sequelize_2.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                },
            },
        });
        // If there are already 5 or more transfers to this recipient in the last 24 hours
        if (recentTransfers >= 5) {
            console.warn(`Suspicious pattern detected: User ${senderId} made ${recentTransfers} transfers to ${receiverId} in 24 hours`);
            // Could implement additional verification here if needed
        }
        // Check for daily transfer limit
        const dailyTransfers = await transaction_model_1.Transaction.sum("amount", {
            where: {
                senderId,
                type: "transfer",
                status: "completed",
                createdAt: {
                    [sequelize_2.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)), // Today
                },
            },
        });
        const dailyLimit = 50000; // Example limit: 50,000 CUTcoins per day
        if ((dailyTransfers || 0) + amount > dailyLimit) {
            throw new HttpException_1.HttpException(400, `Daily transfer limit of ${dailyLimit} CUTcoins exceeded`);
        }
    }
    async getTransactionHistory(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            $or: [{ senderId: userId }, { receiverId: userId }],
        };
        if (query.type) {
            whereClause.type = query.type;
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
                {
                    model: user_model_1.User,
                    as: "receiver",
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        // Format transactions for better readability
        const transactions = rows.map((transaction) => {
            var _a, _b, _c, _d;
            const isSender = transaction.senderId === userId;
            const isReceiver = transaction.receiverId === userId;
            const isDeposit = transaction.type === "deposit";
            const isWithdrawal = transaction.type === "withdrawal";
            let description = transaction.description;
            let amount = Number(transaction.amount);
            if (transaction.type === "transfer") {
                if (isSender) {
                    description = `Transfer to ${(_a = transaction.receiver) === null || _a === void 0 ? void 0 : _a.firstName} ${(_b = transaction.receiver) === null || _b === void 0 ? void 0 : _b.lastName}`;
                    amount = -amount; // Negative for outgoing
                }
                else if (isReceiver) {
                    description = `Transfer from ${(_c = transaction.sender) === null || _c === void 0 ? void 0 : _c.firstName} ${(_d = transaction.sender) === null || _d === void 0 ? void 0 : _d.lastName}`;
                }
            }
            else if (isDeposit) {
                description = "Deposit to wallet";
            }
            else if (isWithdrawal) {
                description = "Withdrawal from wallet";
                amount = -amount; // Negative for outgoing
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
    async getTransactionDetails(userId, transactionId) {
        const transaction = await transaction_model_1.Transaction.findOne({
            where: {
                id: transactionId,
                $or: [{ senderId: userId }, { receiverId: userId }],
            },
            include: [
                {
                    model: user_model_1.User,
                    as: "sender",
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
                {
                    model: user_model_1.User,
                    as: "receiver",
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        if (!transaction) {
            throw new HttpException_1.HttpException(404, "Transaction not found");
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
        };
    }
}
exports.WalletService = WalletService;
//# sourceMappingURL=wallet.service.js.map