import { User } from "../models/user.model"
import { Notification } from "../models/notification.model"
import { HttpException } from "../exceptions/HttpException"
import { sendSMS } from "../utils/sms"

export class NotificationService {
  public async sendSMS(data: { userId: number; message: string; saveNotification?: boolean }) {
    const { userId, message, saveNotification = true } = data

    // Find user
    const user = await User.findByPk(userId)
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Send SMS
    const smsSent = await sendSMS(user.phoneNumber, message)

    // Save notification if requested
    if (saveNotification) {
      await Notification.create({
        userId,
        type: "sms",
        title: "SMS Notification",
        message,
        isSent: smsSent,
      })
    }

    return {
      success: smsSent,
      message: smsSent ? "SMS sent successfully" : "Failed to send SMS",
    }
  }

  public async bulkSendSMS(data: { userIds: number[]; message: string; saveNotification?: boolean }) {
    const { userIds, message, saveNotification = true } = data

    // Find users
    const users = await User.findAll({
      where: {
        id: userIds,
      },
    })

    if (users.length === 0) {
      throw new HttpException(404, "No users found")
    }

    // Send SMS to each user
    const results = await Promise.all(
      users.map(async (user) => {
        const smsSent = await sendSMS(user.phoneNumber, message)

        // Save notification if requested
        if (saveNotification) {
          await Notification.create({
            userId: user.id,
            type: "sms",
            title: "SMS Notification",
            message,
            isSent: smsSent,
          })
        }

        return {
          userId: user.id,
          phoneNumber: user.phoneNumber,
          success: smsSent,
        }
      }),
    )

    const successCount = results.filter((result) => result.success).length

    return {
      totalSent: successCount,
      totalFailed: results.length - successCount,
      results,
    }
  }

  public async createNotification(data: { userId: number; type: string; title: string; message: string; data?: any }) {
    // Find user
    const user = await User.findByPk(data.userId)
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Create notification
    const notification = await Notification.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
      isRead: false,
      isSent: true,
    })

    return notification
  }

  public async getUserNotifications(userId: number, query: { page?: number; limit?: number; isRead?: boolean }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {
      userId,
    }

    if (query.isRead !== undefined) {
      whereClause.isRead = query.isRead
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    })

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  public async markNotificationAsRead(userId: number, notificationId: number) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    })

    if (!notification) {
      throw new HttpException(404, "Notification not found")
    }

    notification.isRead = true
    await notification.save()

    return {
      message: "Notification marked as read",
      notification,
    }
  }

  public async markAllNotificationsAsRead(userId: number) {
    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false,
        },
      },
    )

    return {
      message: "All notifications marked as read",
    }
  }

  public async deleteNotification(userId: number, notificationId: number) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    })

    if (!notification) {
      throw new HttpException(404, "Notification not found")
    }

    await notification.destroy()

    return {
      message: "Notification deleted successfully",
    }
  }
}
