import type { Request, Response, NextFunction } from "express"
import { PaymentService } from "../services/payment.service"

export class PaymentController {
  private paymentService = new PaymentService()


  public handlePaynowReturnWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference, status, pollurl } = req.body
      
      const result = await this.paymentService.updatePaymentStatusFromWebhook(reference, status, pollurl)
      
      res.status(200).json(result)
    } catch (error) {
      //logger.error("Payment webhook error:", error)
      // For webhooks, we always respond with 200 to acknowledge receipt
      // even if there's an error, to prevent retries
      res.status(200).json({ 
        success: false, 
        message: "Error processing payment webhook" 
      })
    }
  }


  // User endpoints
  public initiatePaynowPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
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
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const userId = req.user.id
      const { reference } = req.params
      const result = await this.paymentService.confirmCashDeposit(userId, reference)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public getStudentDeposits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      const userId = req.user.id
      const result = await this.paymentService.getStudentDeposits(userId, req.query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Merchant endpoints
  public initiateCashDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      // Get merchant ID from user's merchant profile
      const merchant = await req.user.getMerchant()
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

  public getMerchantDeposits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
       res.status(401).json({ message: "Unauthorized" })
       return 
      }

      // Get merchant ID from user's merchant profile
      const merchant = await req.merchant
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

  public getMerchantDepositDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
         res.status(401).json({ message: "Unauthorized" })
         return
      }

      // Get merchant ID from user's merchant profile
      const merchant = await req.merchant
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

  // Merchant deposits funds to their wallet
  public merchantDepositFunds = async (req:Request, res: Response, next: NextFunction) => {
    try {
      if (!req.merchant) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      // Get merchant ID from user's merchant profile
      const merchant = await req.merchant
      if (!merchant) {
        res.status(403).json({ message: "User is not a merchant" })
        return 
      }

      const result = await this.paymentService.merchantDepositFunds(req.merchant.userId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Admin endpoints
  public adminApproveCashDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin || !req.admin.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const adminId = req.admin.id
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
      if (!req.admin || !req.admin.id) {
       res.status(401).json({ message: "Unauthorized" })
       return 
      }

      const adminId = req.admin.id
      const { rate } = req.body
      const result = await this.paymentService.updateExchangeRate(adminId, rate)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  public setMerchantDepositLimits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin || !req.admin.id) {
       res.status(401).json({ message: "Unauthorized" })
       return 
      }

      const adminId = req.admin.id
      const result = await this.paymentService.setMerchantDepositLimits(adminId, req.body)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  // Admin approves merchant deposit
  public adminApproveMerchantDeposit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.admin || !req.admin.id) {
        res.status(401).json({ message: "Unauthorized" })
        return 
      }

      const adminId = req.admin.id
      const paymentId = Number(req.params.id)
      const result = await this.paymentService.adminApproveMerchantDeposit(adminId, paymentId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
