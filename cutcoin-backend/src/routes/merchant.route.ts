import { Router } from "express"
import { MerchantController } from "../controllers/merchant.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import { RegisterMerchantDto, UpdateMerchantDto, InitiatePaymentDto, ConfirmPaymentDto } from "../dtos/merchant.dto"

const router = Router()
const merchantController = new MerchantController()

// All merchant routes require authentication
router.use(authMiddleware)

// Merchant registration and profile
router.post("/register", validationMiddleware(RegisterMerchantDto), merchantController.registerMerchant)
router.get("/profile", merchantController.getMerchantProfile)
router.put("/profile", validationMiddleware(UpdateMerchantDto), merchantController.updateMerchantProfile)

// Payment processing
router.post(
  "/:merchantId/payment/initiate",
  validationMiddleware(InitiatePaymentDto),
  merchantController.initiatePayment,
)
router.post("/payment/confirm", validationMiddleware(ConfirmPaymentDto), merchantController.confirmPayment)

// Transaction history
router.get("/:merchantId/transactions", merchantController.getMerchantTransactions)

export default router
