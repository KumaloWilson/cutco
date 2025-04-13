import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/auth.service"

export class AuthController {
  private authService = new AuthService()

  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body

      const result = await this.authService.register(userData)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.verifyOTP(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public verifyLoginOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.verifyLoginOTP(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.requestPasswordReset(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public resetPin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.resetPin(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public completeKYC = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id // From auth middleware
      if (!userId) {
        return res.status(403).json({ message: "User not found" })
      }
      const result = await this.authService.completeKYC(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
