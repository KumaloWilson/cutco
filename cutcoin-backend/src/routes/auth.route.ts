import { Router } from "express"
import { AuthController } from "../controllers/auth.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  VerifyLoginOtpDto,
  RequestPasswordResetDto,
  ResetPinDto,
  KycDto,
} from "../dtos/auth.dto"

const router = Router()
const authController = new AuthController()

// Public routes
router.post("/register", validationMiddleware(RegisterDto), authController.register)
router.post("/verify-otp", validationMiddleware(VerifyOtpDto), authController.verifyOTP)
router.post("/login", validationMiddleware(LoginDto), authController.login)
router.post("/verify-login", validationMiddleware(VerifyLoginOtpDto), authController.verifyLoginOTP)
router.post("/request-reset", validationMiddleware(RequestPasswordResetDto), authController.requestPasswordReset)
router.post("/reset-pin", validationMiddleware(ResetPinDto), authController.resetPin)

// Protected routes
router.post("/kyc", authMiddleware, validationMiddleware(KycDto), authController.completeKYC)

export default router
