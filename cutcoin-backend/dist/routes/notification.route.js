"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const notification_dto_1 = require("../dtos/notification.dto");
const router = (0, express_1.Router)();
const notificationController = new notification_controller_1.NotificationController();
// Admin routes
router.use("/admin", admin_middleware_1.adminMiddleware);
router.post("/admin/sms", (0, validation_middleware_1.validationMiddleware)(notification_dto_1.SendSMSDto), notificationController.sendSMS);
router.post("/admin/sms/bulk", (0, validation_middleware_1.validationMiddleware)(notification_dto_1.BulkSendSMSDto), notificationController.bulkSendSMS);
router.post("/admin/create", (0, validation_middleware_1.validationMiddleware)(notification_dto_1.CreateNotificationDto), notificationController.createNotification);
// User routes
router.use("/user", auth_middleware_1.authMiddleware);
router.get("/user", notificationController.getUserNotifications);
router.put("/user/:id/read", notificationController.markNotificationAsRead);
router.put("/user/read-all", notificationController.markAllNotificationsAsRead);
router.delete("/user/:id", notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.route.js.map