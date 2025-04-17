"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const router = (0, express_1.Router)();
const analyticsController = new analytics_controller_1.AnalyticsController();
// All analytics routes require admin authentication
router.use(admin_middleware_1.adminMiddleware);
// Dashboard stats
router.get("/dashboard", analyticsController.getDashboardStats);
// Transaction stats
router.get("/transactions", analyticsController.getTransactionStats);
// User stats
router.get("/users", analyticsController.getUserStats);
// Merchant stats
router.get("/merchants", analyticsController.getMerchantStats);
// Wallet stats
router.get("/wallets", analyticsController.getWalletStats);
exports.default = router;
//# sourceMappingURL=analytics.route.js.map