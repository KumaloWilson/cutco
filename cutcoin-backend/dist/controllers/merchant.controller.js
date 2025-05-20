"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MerchantController = void 0;
const merchant_service_1 = require("../services/merchant.service");
class MerchantController {
    constructor() {
        this.merchantService = new merchant_service_1.MerchantService();
        this.registerMerchant = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.merchantService.registerMerchant(userId, req.body);
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantProfile = async (req, res, next) => {
            try {
                if (!req.merchant) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.merchant.userId;
                const result = await this.merchantService.getMerchantProfile(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateMerchantProfile = async (req, res, next) => {
            try {
                if (!req.merchant) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.merchant.userId;
                const result = await this.merchantService.updateMerchantProfile(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.initiatePayment = async (req, res, next) => {
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
                const result = await this.merchantService.initiatePayment(merchant.id, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.confirmPayment = async (req, res, next) => {
            try {
                const result = await this.merchantService.confirmPayment(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.MerchantController = MerchantController;
//# sourceMappingURL=merchant.controller.js.map