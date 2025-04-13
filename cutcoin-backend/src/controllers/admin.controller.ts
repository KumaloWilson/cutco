import type { Request, Response, NextFunction } from "express"
import { AdminService } from "../services/admin.service"

export class AdminController {
  private adminService = new AdminService()

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.login(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const result = await this.adminService.createAdmin(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const adminId = req.admin.id
      const result = await this.adminService.getAdminProfile(adminId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateAdminProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin || !req.admin.id) {
        return res.status(401).json({ message: "Unauthorized" })
      }

      const adminId = req.admin.id
      const result = await this.adminService.updateAdminProfile(adminId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getAllUsers(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId)
      const result = await this.adminService.getUserDetails(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = Number(req.params.userId)
      const result = await this.adminService.updateUserStatus(userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAllMerchants = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getAllMerchants(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      const result = await this.adminService.getMerchantDetails(merchantId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateMerchantStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantId = Number(req.params.merchantId)
      const result = await this.adminService.updateMerchantStatus(merchantId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getSystemStats()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getSystemConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getSystemConfig()
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateSystemConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.updateSystemConfig(req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.adminService.getAuditLogs(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
