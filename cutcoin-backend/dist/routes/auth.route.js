"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_dto_1 = require("../dtos/auth.dto");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Public routes
router.post("/register", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.RegisterDto), authController.register);
router.post("/verify-otp", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.VerifyOtpDto), authController.verifyOTP);
router.post("/login", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.LoginDto), authController.login);
router.post("/verify-login", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.VerifyLoginOtpDto), authController.verifyLoginOTP);
router.post("/request-reset", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.RequestPasswordResetDto), authController.requestPasswordReset);
router.post("/reset-pin", (0, validation_middleware_1.validationMiddleware)(auth_dto_1.ResetPinDto), authController.resetPin);
// Protected routes
router.post("/kyc", auth_middleware_1.authMiddleware, (0, validation_middleware_1.validationMiddleware)(auth_dto_1.KycDto), authController.completeKYC);
exports.default = router;
//# sourceMappingURL=auth.route.js.map