import type { Request, Response, NextFunction } from "express"
import { MerchantService } from "../services/merchant.service"
import type { RequestWithUser } from "../middlewares/auth.middleware"

export class MerchantController {
  private merchantService = new MerchantService()

  public registerMerchant = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.merchantService.registerMerchant(userId, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.merchantService.getMerchantProfile(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateMerchantProfile = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.merchantService.updateMerchantProfile(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public initiatePayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      const result = await this.merchantService.initiatePayment(merchantId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.merchantService.confirmPayment(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantTransactions = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      const result = await this.merchantService.getMerchantTransactions(merchantId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
