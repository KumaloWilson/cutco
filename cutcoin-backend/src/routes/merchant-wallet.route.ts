import { WalletController } from "../controllers/wallet.controller"
import { Router } from "express"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"

const router = Router()
const walletController = new WalletController()

// All wallet routes require authentication
router.use(merchantAuthMiddleware)

// Wallet balance
router.get("/balance", walletController.getWalletBalance)

export default router
