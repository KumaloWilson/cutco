import type { Request, Response, NextFunction } from "express"
import { WalletService } from "../services/wallet.service"

export class WalletController {
  private walletService = new WalletService()

  public getWalletBalance = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const result = await this.walletService.getWalletBalance(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public initiateDeposit = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
      const result = await this.walletService.initiateDeposit(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public merchantConfirmDeposit = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchantUserId = req.user.id
      const result = await this.walletService.merchantConfirmDeposit(merchantUserId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public initiateWithdrawal = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const result = await this.walletService.initiateWithdrawal(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmWithdrawalOTP = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      const userId = req.user.id
      const result = await this.walletService.confirmWithdrawalOTP(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public merchantConfirmWithdrawal = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchantUserId = req.user.id
      const result = await this.walletService.merchantConfirmWithdrawal(merchantUserId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public cancelMerchantTransaction = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
       res.status(401).json({ message: "Unauthorized" })
       return 
      }

      const userId = req.user.id
      const result = await this.walletService.cancelMerchantTransaction(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantPendingTransactions = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const merchantUserId = req.user.id
      const result = await this.walletService.getMerchantPendingTransactions(merchantUserId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getUserPendingTransactions = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
      const result = await this.walletService.getUserPendingTransactions(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public transfer = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
      const result = await this.walletService.transfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmTransfer = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const result = await this.walletService.confirmTransfer(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionHistory = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
      const result = await this.walletService.getTransactionHistory(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getTransactionDetails = async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
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
