import type { Request, Response, NextFunction } from "express"
import { MerchantService } from '../services/merchant.service';

export class MerchantTransactionController {
  private merchantService = new MerchantService()


  public getPendingTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchant = await req.merchant
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return 
      }

      const result = await this.merchantService.getPendingMerchantTransactions(merchant.id, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }


  public getMerchantTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const merchant = await req.merchant

      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return 
      }

      const result = await this.merchantService.getMerchantTransactions(merchant.id, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
