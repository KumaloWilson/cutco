import type { Request, Response, NextFunction } from "express"
import { MerchantAuthService } from "../services/merchant-auth.service"

export class MerchantAuthController {
  private merchantAuthService = new MerchantAuthService()

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantData = req.body
      const result = await this.merchantAuthService.register(merchantData)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.merchantAuthService.verifyOTP(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.merchantAuthService.login(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.merchantAuthService.requestPasswordReset(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.merchantAuthService.resetPassword(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
