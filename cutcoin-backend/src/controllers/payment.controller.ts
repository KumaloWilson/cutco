import type { Request, Response, NextFunction } from "express"
import { PaymentService } from "../services/payment.service"

export class PaymentController {
  private paymentService = new PaymentService()

  // User endpoints
  public initiatePaynowPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      const { amount } = req.body
      const result = await this.paymentService.initiatePaynowPayment(userId, amount)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public verifyPaynowPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params
      const result = await this.paymentService.verifyPaynowPayment(reference)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public confirmCashDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      const { reference } = req.params
      const result = await this.paymentService.confirmCashDeposit(userId, reference)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getStudentDeposits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      const result = await this.paymentService.getStudentDeposits(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Merchant endpoints
  public initiateCashDeposit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get merchant ID from user's merchant profile
      const merchant = await req.user?.getMerchant()
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return
      }
  
      const result = await this.paymentService.initiateCashDeposit(merchant.id, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantDeposits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get merchant ID from user's merchant profile
      const merchant = await req.user?.getMerchant()
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return
      }
  
      const result = await this.paymentService.getMerchantDeposits(merchant.id, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getMerchantDepositDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get merchant ID from user's merchant profile
      const merchant = await req.user?.getMerchant()
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return
      }
  
      const depositId = Number(req.params.id)
      const result = await this.paymentService.getMerchantDepositDetails(merchant.id, depositId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Admin endpoints
  public adminApproveCashDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.admin?.id
      const depositId = Number(req.params.id)
      const result = await this.paymentService.adminApproveCashDeposit(adminId, depositId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAllPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentService.getAllPayments(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getAllMerchantDeposits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.paymentService.getAllMerchantDeposits(req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateExchangeRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.admin?.id
      const { rate } = req.body
      const result = await this.paymentService.updateExchangeRate(adminId, rate)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public setMerchantDepositLimits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.admin?.id
      const result = await this.paymentService.setMerchantDepositLimits(adminId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
