import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { HttpException } from "../exceptions/HttpException"
import { User } from "../models/user.model"

export interface RequestWithUser extends Request {
  user: User
}

export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.header("Authorization")?.split("Bearer ")[1] || null

    if (!Authorization) {
      return next(new HttpException(401, "Authentication token missing"))
    }

    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const verificationResponse = jwt.verify(Authorization, secretKey) as { id: number }
    const userId = verificationResponse.id

    const user = await User.findByPk(userId)
    if (!user) {
      return next(new HttpException(401, "Invalid authentication token"))
    }

    req.user = user
    next()
  } catch (error) {
    next(new HttpException(401, "Invalid authentication token"))
  }
}
