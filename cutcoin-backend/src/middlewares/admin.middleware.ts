import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { HttpException } from "../exceptions/HttpException"
import { Admin } from "../models/admin.model"

export interface RequestWithAdmin extends Request {
  admin: Admin
}

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.header("Authorization")?.split("Bearer ")[1] || null

    if (!Authorization) {
      return next(new HttpException(401, "Authentication token missing"))
    }

    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const verificationResponse = jwt.verify(Authorization, secretKey) as { id: number; isAdmin: boolean }

    if (!verificationResponse.isAdmin) {
      return next(new HttpException(403, "Unauthorized: Admin access required"))
    }

    const adminId = verificationResponse.id

    const admin = await Admin.findByPk(adminId)
    if (!admin) {
      return next(new HttpException(401, "Invalid authentication token"))
    }

    if (!admin.isActive) {
      return next(new HttpException(403, "Admin account is inactive"))
    }
    // Cast req to RequestWithAdmin to add the admin property
    ;(req as RequestWithAdmin).admin = admin
    next()
  } catch (error) {
    next(new HttpException(401, "Invalid authentication token"))
  }
}

export const superAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as RequestWithAdmin).admin) {
      return next(new HttpException(401, "Authentication required"))
    }

    if ((req as RequestWithAdmin).admin.role !== "super_admin") {
      return next(new HttpException(403, "Unauthorized: Super admin access required"))
    }

    next()
  } catch (error) {
    next(new HttpException(401, "Invalid authentication token"))
  }
}
