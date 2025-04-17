"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth.route"));
const wallet_route_1 = __importDefault(require("./wallet.route"));
const merchant_route_1 = __importDefault(require("./merchant.route"));
const admin_route_1 = __importDefault(require("./admin.route"));
const analytics_route_1 = __importDefault(require("./analytics.route"));
const notification_route_1 = __importDefault(require("./notification.route"));
const payment_route_1 = __importDefault(require("./payment.route"));
const rate_limiter_middleware_1 = require("../middlewares/rate-limiter.middleware");
const logger_middleware_1 = require("../middlewares/logger.middleware");
const router = (0, express_1.Router)();
// Apply global middlewares
router.use(logger_middleware_1.requestLogger);
router.use(rate_limiter_middleware_1.apiLimiter);
// Apply specific rate limiters
router.use("/auth/login", rate_limiter_middleware_1.authLimiter);
router.use("/auth/verify-login", rate_limiter_middleware_1.authLimiter);
// Register routes
router.use("/auth", auth_route_1.default);
router.use("/wallet", wallet_route_1.default);
router.use("/merchant", merchant_route_1.default);
router.use("/admin", admin_route_1.default);
router.use("/analytics", analytics_route_1.default);
router.use("/notifications", notification_route_1.default);
router.use("/payments", payment_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map