import type { Response, NextFunction } from "express"
import { NotificationService } from "../services/notification.service"
import type { RequestWithUser } from "../middlewares/auth.middleware"
import type { RequestWithAdmin } from "../middlewares/admin.middleware"

export class NotificationController {
  private notificationService = new NotificationService()

  // Admin endpoints
  public sendSMS = async (req: RequestWithAdmin, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.sendSMS(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public bulkSendSMS = async (req: RequestWithAdmin, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.bulkSendSMS(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public createNotification = async (req: RequestWithAdmin, res: Response, next: NextFunction) => {
    try {
      const result = await this.notificationService.createNotification(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // User endpoints
  public getUserNotifications = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.notificationService.getUserNotifications(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public markNotificationAsRead = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const notificationId = Number(req.params.id)
      const result = await this.notificationService.markNotificationAsRead(userId, notificationId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public markAllNotificationsAsRead = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.notificationService.markAllNotificationsAsRead(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public deleteNotification = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const notificationId = Number(req.params.id)
      const result = await this.notificationService.deleteNotification(userId, notificationId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
