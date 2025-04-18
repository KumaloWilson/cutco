import type { Request, Response, NextFunction } from "express"
import { MerchantTransaction } from "../models/merchant-transaction.model"
import { User } from "../models/user.model"

export class MerchantTransactionController {
  public getPendingTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const merchantId = req.merchant.id
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : undefined

      const transactions = await MerchantTransaction.findAll({
        where: {
          merchantId,
          status: "pending",
        },
        order: [["createdAt", "DESC"]],
        limit,
        include: [
          {
            model: User,
            as: "customer",
            attributes: ["id", "firstName", "lastName", "phoneNumber"],
          },
        ],
      })

      res.status(200).json({ transactions })
    } catch (error) {
      next(error)
    }
  }
}
