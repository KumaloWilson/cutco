import type { Request, Response, NextFunction } from "express"
import { WalletService } from "../services/wallet.service"

export class WalletController {
  private walletService = new WalletService()

  public getWalletBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.walletService.getWalletBalance(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public deposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const { amount } = req.body
      const result = await this.walletService.deposit(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public withdraw = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const { amount } = req.body
      const result = await this.walletService.withdraw(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmWithdrawal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.walletService.confirmWithdrawal(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public transfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.walletService.transfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmTransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.walletService.confirmTransfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const result = await this.walletService.getTransactionHistory(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const userId = req.user.id
      const transactionId = Number(req.params.id)
      const result = await this.walletService.getTransactionDetails(userId, transactionId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
