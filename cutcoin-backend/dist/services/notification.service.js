"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const user_model_1 = require("../models/user.model");
const notification_model_1 = require("../models/notification.model");
const HttpException_1 = require("../exceptions/HttpException");
const sms_1 = require("../utils/sms");
class NotificationService {
    async sendSMS(data) {
        const { userId, message, saveNotification = true } = data;
        // Find user
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Send SMS
        const smsSent = await (0, sms_1.sendSMS)(user.phoneNumber, message);
        // Save notification if requested
        if (saveNotification) {
            await notification_model_1.Notification.create({
                userId,
                type: "sms",
                title: "SMS Notification",
                message,
                isSent: smsSent,
            });
        }
        return {
            success: smsSent,
            message: smsSent ? "SMS sent successfully" : "Failed to send SMS",
        };
    }
    async bulkSendSMS(data) {
        const { userIds, message, saveNotification = true } = data;
        // Find users
        const users = await user_model_1.User.findAll({
            where: {
                id: userIds,
            },
        });
        if (users.length === 0) {
            throw new HttpException_1.HttpException(404, "No users found");
        }
        // Send SMS to each user
        const results = await Promise.all(users.map(async (user) => {
            const smsSent = await (0, sms_1.sendSMS)(user.phoneNumber, message);
            // Save notification if requested
            if (saveNotification) {
                await notification_model_1.Notification.create({
                    userId: user.id,
                    type: "sms",
                    title: "SMS Notification",
                    message,
                    isSent: smsSent,
                });
            }
            return {
                userId: user.id,
                phoneNumber: user.phoneNumber,
                success: smsSent,
            };
        }));
        const successCount = results.filter((result) => result.success).length;
        return {
            totalSent: successCount,
            totalFailed: results.length - successCount,
            results,
        };
    }
    async createNotification(data) {
        // Find user
        const user = await user_model_1.User.findByPk(data.userId);
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Create notification
        const notification = await notification_model_1.Notification.create({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data || {},
            isRead: false,
            isSent: true,
        });
        return notification;
    }
    async getUserNotifications(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {
            userId,
        };
        if (query.isRead !== undefined) {
            whereClause.isRead = query.isRead;
        }
        const { count, rows } = await notification_model_1.Notification.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        return {
            notifications: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    async markNotificationAsRead(userId, notificationId) {
        const notification = await notification_model_1.Notification.findOne({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new HttpException_1.HttpException(404, "Notification not found");
        }
        notification.isRead = true;
        await notification.save();
        return {
            message: "Notification marked as read",
            notification,
        };
    }
    async markAllNotificationsAsRead(userId) {
        await notification_model_1.Notification.update({ isRead: true }, {
            where: {
                userId,
                isRead: false,
            },
        });
        return {
            message: "All notifications marked as read",
        };
    }
    async deleteNotification(userId, notificationId) {
        const notification = await notification_model_1.Notification.findOne({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw new HttpException_1.HttpException(404, "Notification not found");
        }
        await notification.destroy();
        return {
            message: "Notification deleted successfully",
        };
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map