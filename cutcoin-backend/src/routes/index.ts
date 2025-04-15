import { Router } from "express"
import authRoutes from "./auth.route"
import walletRoutes from "./wallet.route"
import merchantRoutes from "./merchant.route"
import adminRoutes from "./admin.route"
import analyticsRoutes from "./analytics.route"
import notificationRoutes from "./notification.route"
import paymentRoutes from "./payment.route"
import userRoutes from "./user.route"
import { apiLimiter, authLimiter } from "../middlewares/rate-limiter.middleware"
import { requestLogger } from "../middlewares/logger.middleware"

const router = Router()

// Apply global middlewares
router.use(requestLogger)
router.use(apiLimiter)

// Apply specific rate limiters
router.use("/auth/login", authLimiter)
router.use("/auth/verify-login", authLimiter)

// Register routes
router.use("/auth", authRoutes)
router.use("/wallet", walletRoutes)
router.use("/merchant", merchantRoutes)
router.use("/admin", adminRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/notifications", notificationRoutes)
router.use("/payments", paymentRoutes)
router.use("/users", userRoutes)

export default router
