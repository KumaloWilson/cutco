import { Router } from "express"
import { AdminController } from "../controllers/admin.controller"
import { adminMiddleware, superAdminMiddleware } from "../middlewares/admin.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  AdminLoginDto,
  CreateAdminDto,
  UpdateAdminDto,
  UpdateUserStatusDto,
  UpdateMerchantStatusDto,
  SystemConfigDto,
} from "../dtos/admin.dto"

const router = Router()
const adminController = new AdminController()

// Public routes
router.post("/login", validationMiddleware(AdminLoginDto), adminController.login)

// Protected routes - require admin authentication
router.use(adminMiddleware)

// Admin profile
router.get("/profile", adminController.getAdminProfile)
router.put("/profile", validationMiddleware(UpdateAdminDto), adminController.updateAdminProfile)

// User management
router.get("/users", adminController.getAllUsers)
router.get("/users/:userId", adminController.getUserDetails)
router.put("/users/:userId/status", validationMiddleware(UpdateUserStatusDto), adminController.updateUserStatus)

// Merchant management
router.get("/merchants", adminController.getAllMerchants)
router.get("/merchants/:merchantId", adminController.getMerchantDetails)
router.put(
  "/merchants/:merchantId/status",
  validationMiddleware(UpdateMerchantStatusDto),
  adminController.updateMerchantStatus,
)

// Transaction management
router.get("/all/transactions", adminController.getAllTransactions)
router.get("/transactions/:id", adminController.getTransactionById)

// System stats and configuration
router.get("/stats", adminController.getSystemStats)
router.get("/config", adminController.getSystemConfig)
router.put("/config", validationMiddleware(SystemConfigDto), adminController.updateSystemConfig)

// Audit logs
router.get("/audit-logs", adminController.getAuditLogs)

// Super admin only routes
router.use(superAdminMiddleware)

// Admin management
router.post("/create", validationMiddleware(CreateAdminDto), adminController.createAdmin)

export default router
