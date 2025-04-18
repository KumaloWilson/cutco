import { Router } from "express"
import { MerchantDashboardController } from "../controllers/merchant-dashboard.controller"
import { merchantAuthMiddleware } from "../middlewares/merchant-auth.middleware"

const router = Router()
const merchantDashboardController = new MerchantDashboardController()

// All merchant dashboard routes require merchant authentication
router.use(merchantAuthMiddleware)

// Dashboard stats
router.get("/stats", merchantDashboardController.getDashboardStats)

// Recent transactions
router.get("/transactions/recent", merchantDashboardController.getRecentTransactions)

// Transaction stats
router.get("/transactions/stats", merchantDashboardController.getTransactionStats)

// Deposit stats
router.get("/deposits/stats", merchantDashboardController.getDepositStats)

export default router
