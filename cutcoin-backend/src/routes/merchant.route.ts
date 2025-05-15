import { Router } from "express"
import { MerchantController } from "../controllers/merchant.controller"
import { validationMiddleware } from "../middlewares/validation.middleware"
import { RegisterMerchantDto, UpdateMerchantDto, InitiatePaymentDto, ConfirmPaymentDto } from "../dtos/merchant.dto"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"

const router = Router()
const merchantController = new MerchantController()

// All merchant routes require authentication
router.use(merchantAuthMiddleware)

// Merchant registration and profile
router.post("/register", validationMiddleware(RegisterMerchantDto), merchantController.registerMerchant)
router.get("/profile", merchantController.getMerchantProfile)
router.put("/profile", validationMiddleware(UpdateMerchantDto), merchantController.updateMerchantProfile)




// Payment processing
router.post("/payment/initiate", validationMiddleware(InitiatePaymentDto), merchantController.initiatePayment)
router.post("/payment/confirm", validationMiddleware(ConfirmPaymentDto), merchantController.confirmPayment)


export default router
