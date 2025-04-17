import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { HttpException } from "../exceptions/HttpException"
import { Merchant } from "../models/merchant.model"

export const merchantAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies["Authorization"] || req.header("Authorization")?.split("Bearer ")[1] || null

    if (!Authorization) {
      return next(new HttpException(401, "Authentication token missing"))
    }

    const secretKey: string = process.env.JWT_SECRET || "your-secret-key"
    const verificationResponse = jwt.verify(Authorization, secretKey) as {
      id: number
      merchantNumber: string
      type: string
    }

    // Check if token is for a merchant
    if (verificationResponse.type !== "merchant") {
      return next(new HttpException(403, "Invalid token type"))
    }

    const merchantId = verificationResponse.id
    const findMerchant = await Merchant.findByPk(merchantId)

    if (!findMerchant) {
      return next(new HttpException(401, "Invalid authentication token"))
    }

    if (findMerchant.status !== "approved" || !findMerchant.isActive) {
      return next(new HttpException(403, "Merchant account is not active"))
    }

    req.merchant = findMerchant
    next()
  } catch (error) {
    next(new HttpException(401, "Invalid authentication token"))
  }
}
