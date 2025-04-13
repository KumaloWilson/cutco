import type { Request, Response, NextFunction } from "express"
import { NotificationService } from "../services/notification.service"

export class NotificationController {
  private notificationService = new NotificationService()

  // Admin endpoints
  public sendSMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const result = await this.notificationService.sendSMS(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public bulkSendSMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const result = await this.notificationService.bulkSendSMS(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public createNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const result = await this.notificationService.createNotification(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  // User endpoints
  public getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.notificationService.getUserNotifications(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const notificationId = Number(req.params.id)
      const result = await this.notificationService.markNotificationAsRead(userId, notificationId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public markAllNotificationsAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.notificationService.markAllNotificationsAsRead(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const notificationId = Number(req.params.id)
      const result = await this.notificationService.deleteNotification(userId, notificationId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
