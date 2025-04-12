import type { Response, NextFunction } from "express"
import { WalletService } from "../services/wallet.service"
import type { RequestWithUser } from "../middlewares/auth.middleware"

export class WalletController {
  private walletService = new WalletService()

  public getWalletBalance = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.walletService.getWalletBalance(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public deposit = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const { amount } = req.body
      const result = await this.walletService.deposit(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public withdraw = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const { amount } = req.body
      const result = await this.walletService.withdraw(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmWithdrawal = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.walletService.confirmWithdrawal(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public transfer = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.walletService.transfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmTransfer = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.walletService.confirmTransfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionHistory = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const result = await this.walletService.getTransactionHistory(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionDetails = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      const transactionId = Number(req.params.id)
      const result = await this.walletService.getTransactionDetails(userId, transactionId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
