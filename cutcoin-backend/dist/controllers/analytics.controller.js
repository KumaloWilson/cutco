"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
class AnalyticsController {
    constructor() {
        this.analyticsService = new analytics_service_1.AnalyticsService();
        this.getDashboardStats = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.analyticsService.getDashboardStats();
                res.status(200).json(result);
                return;
            }
            catch (error) {
                next(error);
            }
        };
        this.getTransactionStats = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.analyticsService.getTransactionStats(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserStats = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.analyticsService.getUserStats(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getMerchantStats = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.analyticsService.getMerchantStats(req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getWalletStats = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.analyticsService.getWalletStats();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map