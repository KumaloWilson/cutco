import { Router } from "express"
import { NotificationController } from "../controllers/notification.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { adminMiddleware } from "../middlewares/admin.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import { SendSMSDto, BulkSendSMSDto, CreateNotificationDto } from "../dtos/notification.dto"

const router = Router()
const notificationController = new NotificationController()

// Admin routes
router.use("/admin", adminMiddleware)
router.post("/admin/sms", validationMiddleware(SendSMSDto), notificationController.sendSMS)
router.post("/admin/sms/bulk", validationMiddleware(BulkSendSMSDto), notificationController.bulkSendSMS)
router.post("/admin/create", validationMiddleware(CreateNotificationDto), notificationController.createNotification)

// User routes
router.use("/user", authMiddleware)
router.get("/user", notificationController.getUserNotifications)
router.put("/user/:id/read", notificationController.markNotificationAsRead)
router.put("/user/read-all", notificationController.markAllNotificationsAsRead)
router.delete("/user/:id", notificationController.deleteNotification)

export default router
