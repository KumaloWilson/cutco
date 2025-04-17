"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
class NotificationController {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
        // Admin endpoints
        this.sendSMS = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.notificationService.sendSMS(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.bulkSendSMS = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.notificationService.bulkSendSMS(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.createNotification = async (req, res, next) => {
            try {
                if (!req.admin) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const result = await this.notificationService.createNotification(req.body);
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        // User endpoints
        this.getUserNotifications = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.notificationService.getUserNotifications(userId, req.query);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.markNotificationAsRead = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const notificationId = Number(req.params.id);
                const result = await this.notificationService.markNotificationAsRead(userId, notificationId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.markAllNotificationsAsRead = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const result = await this.notificationService.markAllNotificationsAsRead(userId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteNotification = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const userId = req.user.id;
                const notificationId = Number(req.params.id);
                const result = await this.notificationService.deleteNotification(userId, notificationId);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map