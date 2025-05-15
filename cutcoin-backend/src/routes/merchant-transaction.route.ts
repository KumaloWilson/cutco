import { Router } from "express"
import { MerchantTransactionController } from "../controllers/merchant-transaction.controller"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import { MerchantConfirmTransactionDto } from "../dtos/wallet.dto"
import { WalletController } from "../controllers/wallet.controller"

const router = Router()
const merchantTransactionController = new MerchantTransactionController()
const walletController = new WalletController()

// All merchant transaction routes require merchant authentication
router.use(merchantAuthMiddleware)

router.get("/", merchantTransactionController.getMerchantTransactions)


router.post(
  "/deposit/merchant-confirm",
  validationMiddleware(MerchantConfirmTransactionDto),
  walletController.merchantConfirmDeposit,
)

router.post(
  "/withdraw/merchant-confirm",
  validationMiddleware(MerchantConfirmTransactionDto),
  walletController.merchantConfirmWithdrawal,
)



// Get pending transactions
router.get("/pending", merchantTransactionController.getPendingTransactions)


export default router
