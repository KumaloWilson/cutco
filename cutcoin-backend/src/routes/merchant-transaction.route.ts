import { Router } from "express"
import { MerchantTransactionController } from "../controllers/merchant-transaction.controller"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"

const router = Router()
const merchantTransactionController = new MerchantTransactionController()

// All merchant transaction routes require merchant authentication
router.use(merchantAuthMiddleware)

router.get("/", merchantTransactionController.getMerchantTransactions)


// Get pending transactions
router.get("/pending", merchantTransactionController.getPendingTransactions)


export default router
