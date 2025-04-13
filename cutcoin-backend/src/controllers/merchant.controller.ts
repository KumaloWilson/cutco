import type { Request, Response, NextFunction } from "express"
import { MerchantService } from "../services/merchant.service"

export class MerchantController {
  private merchantService = new MerchantService()

  public registerMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(403).json({ message: "User not authenticated" })
      }
      const result = await this.merchantService.registerMerchant(userId, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(403).json({ message: "User not authenticated" })
      }
      const result = await this.merchantService.getMerchantProfile(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        return res.status(403).json({ message: "User not authenticated" })
      }
      const result = await this.merchantService.updateMerchantProfile(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      if (!merchantId) {
        return res.status(403).json({ message: "Merchant not found" })
      }
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

  public getMerchantTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      const result = await this.merchantService.getMerchantTransactions(merchantId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
