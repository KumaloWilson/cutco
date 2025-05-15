import { Router } from "express"
import { PaymentController } from "../controllers/payment.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { adminMiddleware } from "../middlewares/admin.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  InitiatePaynowPaymentDto,
  InitiateCashDepositDto,
  UpdateExchangeRateDto,
  MerchantDepositLimitsDto,
} from "../dtos/payment.dto"
import { MerchantDepositFundsDto } from "../dtos/payment.dto"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"

const router = Router()
const paymentController = new PaymentController()

// // User routes
// router.use("/user", authMiddleware)
// router.post("/user/paynow", validationMiddleware(InitiatePaynowPaymentDto), paymentController.initiatePaynowPayment)
// router.get("/user/paynow/:reference/verify", paymentController.verifyPaynowPayment)
// router.post("/user/cash/:reference/confirm", paymentController.confirmCashDeposit)
// router.get("/user/deposits", paymentController.getStudentDeposits)


// Update payment status (webhook from payment gateway)
router.post("/webhooks/paynow/return", paymentController.handlePaynowReturnWebhook)


// Merchant routes
router.use("/merchant", merchantAuthMiddleware)

// router.post(
//   "/merchant/cash-deposit",
//   validationMiddleware(InitiateCashDepositDto),
//   paymentController.initiateCashDeposit,
// )


router.post(
  "/merchant/deposit-funds",
  validationMiddleware(MerchantDepositFundsDto),
  paymentController.merchantDepositFunds,
)
router.get("/merchant/deposits", paymentController.getMerchantDeposits)
router.get("/merchant/deposits/:id", paymentController.getMerchantDepositDetails)

// Admin routes
router.use("/admin", adminMiddleware)
router.post("/admin/deposits/:id/approve", paymentController.adminApproveCashDeposit)
router.post("/admin/merchant-deposits/:id/approve", paymentController.adminApproveMerchantDeposit)
router.get("/admin/payments", paymentController.getAllPayments)
router.get("/admin/deposits", paymentController.getAllMerchantDeposits)
router.put("/admin/exchange-rate", validationMiddleware(UpdateExchangeRateDto), paymentController.updateExchangeRate)
router.put(
  "/admin/merchant-limits",
  validationMiddleware(MerchantDepositLimitsDto),
  paymentController.setMerchantDepositLimits,
)

export default router
