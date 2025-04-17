"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const payment_dto_1 = require("../dtos/payment.dto");
const payment_dto_2 = require("../dtos/payment.dto");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
// User routes
router.use("/user", auth_middleware_1.authMiddleware);
router.post("/user/paynow", (0, validation_middleware_1.validationMiddleware)(payment_dto_1.InitiatePaynowPaymentDto), paymentController.initiatePaynowPayment);
router.get("/user/paynow/:reference/verify", paymentController.verifyPaynowPayment);
router.post("/user/cash/:reference/confirm", paymentController.confirmCashDeposit);
router.get("/user/deposits", paymentController.getStudentDeposits);
// Merchant routes
router.use("/merchant", auth_middleware_1.authMiddleware);
router.post("/merchant/cash-deposit", (0, validation_middleware_1.validationMiddleware)(payment_dto_1.InitiateCashDepositDto), paymentController.initiateCashDeposit);
router.post("/merchant/deposit-funds", (0, validation_middleware_1.validationMiddleware)(payment_dto_2.MerchantDepositFundsDto), paymentController.merchantDepositFunds);
router.get("/merchant/deposits", paymentController.getMerchantDeposits);
router.get("/merchant/deposits/:id", paymentController.getMerchantDepositDetails);
// Admin routes
router.use("/admin", admin_middleware_1.adminMiddleware);
router.post("/admin/deposits/:id/approve", paymentController.adminApproveCashDeposit);
router.post("/admin/merchant-deposits/:id/approve", paymentController.adminApproveMerchantDeposit);
router.get("/admin/payments", paymentController.getAllPayments);
router.get("/admin/deposits", paymentController.getAllMerchantDeposits);
router.put("/admin/exchange-rate", (0, validation_middleware_1.validationMiddleware)(payment_dto_1.UpdateExchangeRateDto), paymentController.updateExchangeRate);
router.put("/admin/merchant-limits", (0, validation_middleware_1.validationMiddleware)(payment_dto_1.MerchantDepositLimitsDto), paymentController.setMerchantDepositLimits);
exports.default = router;
//# sourceMappingURL=payment.route.js.map