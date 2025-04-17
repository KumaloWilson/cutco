"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const merchant_controller_1 = require("../controllers/merchant.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const merchant_dto_1 = require("../dtos/merchant.dto");
const router = (0, express_1.Router)();
const merchantController = new merchant_controller_1.MerchantController();
// All merchant routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Merchant registration and profile
router.post("/register", (0, validation_middleware_1.validationMiddleware)(merchant_dto_1.RegisterMerchantDto), merchantController.registerMerchant);
router.get("/profile", merchantController.getMerchantProfile);
router.put("/profile", (0, validation_middleware_1.validationMiddleware)(merchant_dto_1.UpdateMerchantDto), merchantController.updateMerchantProfile);
// Payment processing
router.post("/payment/initiate", (0, validation_middleware_1.validationMiddleware)(merchant_dto_1.InitiatePaymentDto), merchantController.initiatePayment);
router.post("/payment/confirm", (0, validation_middleware_1.validationMiddleware)(merchant_dto_1.ConfirmPaymentDto), merchantController.confirmPayment);
// Transaction history
router.get("/transactions", merchantController.getMerchantTransactions);
exports.default = router;
//# sourceMappingURL=merchant.route.js.map