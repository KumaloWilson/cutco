import type { Request, Response, NextFunction } from "express"
import { MerchantService } from "../services/merchant.service"

export class MerchantController {
  private merchantService = new MerchantService()

  public registerMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const result = await this.merchantService.registerMerchant(userId, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.merchant.userId
      const result = await this.merchantService.getMerchantProfile(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.merchant.userId

      const result = await this.merchantService.updateMerchantProfile(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public initiatePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      // Get merchant ID from user's merchant profile
      const merchant = await req.user.getMerchant()
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return
      }

      const result = await this.merchantService.initiatePayment(merchant.id, req.body)
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
}
