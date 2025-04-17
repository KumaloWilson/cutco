import { Router } from "express"
import { MerchantAuthController } from "../controllers/merchant-auth.controller"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  MerchantLoginDto,
  MerchantRegisterDto,
  MerchantVerifyOtpDto,
  MerchantResetPasswordDto,
  MerchantRequestResetDto,
} from "../dtos/merchant-auth.dto"

const router = Router()
const merchantAuthController = new MerchantAuthController()

// Public routes
router.post("/register", validationMiddleware(MerchantRegisterDto), merchantAuthController.register)
router.post("/verify-otp", validationMiddleware(MerchantVerifyOtpDto), merchantAuthController.verifyOTP)
router.post("/login", validationMiddleware(MerchantLoginDto), merchantAuthController.login)
router.post(
  "/request-reset",
  validationMiddleware(MerchantRequestResetDto),
  merchantAuthController.requestPasswordReset,
)
router.post("/reset-password", validationMiddleware(MerchantResetPasswordDto), merchantAuthController.resetPassword)

export default router
