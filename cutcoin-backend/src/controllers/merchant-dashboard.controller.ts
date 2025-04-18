import type { Request, Response, NextFunction } from "express"
import { MerchantDashboardService } from "../services/merchant-dashboard.service"

export class MerchantDashboardController {
  private merchantDashboardService = new MerchantDashboardService()

  public getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchant = req.merchant
      const result = await this.merchantDashboardService.getDashboardStats(merchant)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getRecentTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchantId = req.merchant.id
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 5
      const result = await this.merchantDashboardService.getRecentTransactions(merchantId, limit)
      res.status(200).json({ transactions: result })
    } catch (error) {
      next(error)
    }
  }

  public getTransactionStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchantId = req.merchant.id
      const period = (req.query.period as string) || "week"
      const result = await this.merchantDashboardService.getTransactionStats(merchantId, period)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getDepositStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      const merchantId = req.merchant.id
      const period = (req.query.period as string) || "week"
      const result = await this.merchantDashboardService.getDepositStats(merchantId, period)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
