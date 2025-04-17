"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
class PaymentController {
    constructor() {
        this.paymentService = new payment_service_1.PaymentService();
        // User endpoints
        this.initiatePaynowPayment = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const { amount } = req.body;
                const result = await this.paymentService.initiatePaynowPayment(userId, amount);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyPaynowPayment = async (req, res, next) => {
            try {
                const { reference } = req.params;
                const result = await this.paymentService.verifyPaynowPayment(reference);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmCashDeposit = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const { reference } = req.params;
                const result = await this.paymentService.confirmCashDeposit(userId, reference);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getStudentDeposits = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.paymentService.getStudentDeposits(userId, req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Merchant endpoints
        this.initiateCashDeposit = async (req, res, next) => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // Get merchant ID from user's merchant profile
                const merchant = await req.user.getMerchant();
                if (!merchant) {
                    res.status(403).json({ message: "User is not a merchant" });
                    return;
                }
                const result = await this.paymentService.initiateCashDeposit(merchant.id, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantDeposits = async (req, res, next) => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // Get merchant ID from user's merchant profile
                const merchant = await req.user.getMerchant();
                if (!merchant) {
                    res.status(403).json({ message: "User is not a merchant" });
                    return;
                }
                const result = await this.paymentService.getMerchantDeposits(merchant.id, req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantDepositDetails = async (req, res, next) => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // Get merchant ID from user's merchant profile
                const merchant = await req.user.getMerchant();
                if (!merchant) {
                    res.status(403).json({ message: "User is not a merchant" });
                    return;
                }
                const depositId = Number(req.params.id);
                const result = await this.paymentService.getMerchantDepositDetails(merchant.id, depositId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Merchant deposits funds to their wallet
        this.merchantDepositFunds = async (req, res, next) => {
            try {
                if (!req.user) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                // Get merchant ID from user's merchant profile
                const merchant = await req.user.getMerchant();
                if (!merchant) {
                    res.status(403).json({ message: "User is not a merchant" });
                    return;
                }
                const result = await this.paymentService.merchantDepositFunds(req.user.id, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Admin endpoints
        this.adminApproveCashDeposit = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const depositId = Number(req.params.id);
                const result = await this.paymentService.adminApproveCashDeposit(adminId, depositId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllPayments = async (req, res, next) => {
            try {
                const result = await this.paymentService.getAllPayments(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getAllMerchantDeposits = async (req, res, next) => {
            try {
                const result = await this.paymentService.getAllMerchantDeposits(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateExchangeRate = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const { rate } = req.body;
                const result = await this.paymentService.updateExchangeRate(adminId, rate);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.setMerchantDepositLimits = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const result = await this.paymentService.setMerchantDepositLimits(adminId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // Admin approves merchant deposit
        this.adminApproveMerchantDeposit = async (req, res, next) => {
            try {
                if (!req.admin || !req.admin.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const adminId = req.admin.id;
                const paymentId = Number(req.params.id);
                const result = await this.paymentService.adminApproveMerchantDeposit(adminId, paymentId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map