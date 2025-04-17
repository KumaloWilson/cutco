"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const wallet_service_1 = require("../services/wallet.service");
class WalletController {
    constructor() {
        this.walletService = new wallet_service_1.WalletService();
        this.getWalletBalance = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.getWalletBalance(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.initiateDeposit = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.initiateDeposit(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.merchantConfirmDeposit = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const merchantUserId = req.user.id;
                const result = await this.walletService.merchantConfirmDeposit(merchantUserId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.initiateWithdrawal = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.initiateWithdrawal(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmWithdrawalOTP = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.confirmWithdrawalOTP(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.merchantConfirmWithdrawal = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const merchantUserId = req.user.id;
                const result = await this.walletService.merchantConfirmWithdrawal(merchantUserId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.cancelMerchantTransaction = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.cancelMerchantTransaction(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantPendingTransactions = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const merchantUserId = req.user.id;
                const result = await this.walletService.getMerchantPendingTransactions(merchantUserId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserPendingTransactions = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.getUserPendingTransactions(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.transfer = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.transfer(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmTransfer = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.confirmTransfer(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTransactionHistory = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.walletService.getTransactionHistory(userId, req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTransactionDetails = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const transactionId = Number(req.params.id);
                const result = await this.walletService.getTransactionDetails(userId, transactionId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.WalletController = WalletController;
//# sourceMappingURL=wallet.controller.js.map