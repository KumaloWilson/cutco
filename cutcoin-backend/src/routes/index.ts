import { Router } from "express"
import authRoute from "./auth.route"
import userRoute from "./user.route"
import walletRoute from "./wallet.route"
import adminRoute from "./admin.route"
import analyticsRoute from "./analytics.route"
import notificationRoute from "./notification.route"
import merchantRoute from "./merchant.route"
import paymentRoute from "./payment.route"
import merchantAuthRoute from "./merchant-auth.route"
// Add the import for merchant dashboard routes
import merchantDashboardRoutes from "./merchant-dashboard.route"
// Add the import for merchant transaction routes
import merchantTransactionRoutes from "./merchant-transaction.route"

const router = Router()

router.use("/auth", authRoute)
router.use("/users", userRoute)
router.use("/wallets", walletRoute)
router.use("/admin", adminRoute)
router.use("/analytics", analyticsRoute)
router.use("/notifications", notificationRoute)
router.use("/merchants", merchantRoute)
router.use("/payments", paymentRoute)
router.use("/merchant-auth", merchantAuthRoute)

// Add the merchant dashboard routes to the router
router.use("/merchant/dashboard", merchantDashboardRoutes)
// Add the merchant transaction routes to the router
router.use("/merchant/transactions", merchantTransactionRoutes)

export default router
