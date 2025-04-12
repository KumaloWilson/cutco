import type { Response, NextFunction } from "express"
import { AnalyticsService } from "../services/analytics.service"

export class AnalyticsController {
  private analyticsService = new AnalyticsService()

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getDashboardStats()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getTransactionStats(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getUserStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getUserStats(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getMerchantStats(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getWalletStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.analyticsService.getWalletStats()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
