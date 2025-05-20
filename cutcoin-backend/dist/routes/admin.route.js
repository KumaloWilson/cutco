"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const admin_dto_1 = require("../dtos/admin.dto");
const router = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
// Public routes
router.post("/login", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.AdminLoginDto), adminController.login);
// Protected routes - require admin authentication
router.use(admin_middleware_1.adminMiddleware);
// Admin profile
router.get("/profile", adminController.getAdminProfile);
router.put("/profile", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.UpdateAdminDto), adminController.updateAdminProfile);
// User management
router.get("/users", adminController.getAllUsers);
router.get("/users/:userId", adminController.getUserDetails);
router.put("/users/:userId/status", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.UpdateUserStatusDto), adminController.updateUserStatus);
// Merchant management
router.get("/merchants", adminController.getAllMerchants);
router.get("/merchants/:merchantId", adminController.getMerchantDetails);
router.put("/merchants/:merchantId/status", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.UpdateMerchantStatusDto), adminController.updateMerchantStatus);
// Transaction management
router.get("/all/transactions", adminController.getAllTransactions);
router.get("/transactions/:id", adminController.getTransactionById);
// System stats and configuration
router.get("/stats", adminController.getSystemStats);
router.get("/config", adminController.getSystemConfig);
router.put("/config", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.SystemConfigDto), adminController.updateSystemConfig);
// Audit logs
router.get("/audit-logs", adminController.getAuditLogs);
// Super admin only routes
router.use(admin_middleware_1.superAdminMiddleware);
// Admin management
router.post("/create", (0, validation_middleware_1.validationMiddleware)(admin_dto_1.CreateAdminDto), adminController.createAdmin);
exports.default = router;
//# sourceMappingURL=admin.route.js.map