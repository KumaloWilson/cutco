import { Router } from "express"
import { AnalyticsController } from "../controllers/analytics.controller"
import { adminMiddleware } from "../middlewares/admin.middleware"

const router = Router()
const analyticsController = new AnalyticsController()

// All analytics routes require admin authentication
router.use(adminMiddleware)

// Dashboard stats
router.get("/dashboard", analyticsController.getDashboardStats)

// Transaction stats
router.get("/transactions", analyticsController.getTransactionStats)

// User stats
router.get("/users", analyticsController.getUserStats)

// Merchant stats
router.get("/merchants", analyticsController.getMerchantStats)

// Wallet stats
router.get("/wallets", analyticsController.getWalletStats)

export default router
