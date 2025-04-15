import { Router } from "express"
import { WalletController } from "../controllers/wallet.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  DepositDto,
  ConfirmDepositDto,
  WithdrawDto,
  ConfirmWithdrawalDto,
  TransferDto,
  ConfirmTransferDto,
} from "../dtos/wallet.dto"

const router = Router()
const walletController = new WalletController()

// All wallet routes require authentication
router.use(authMiddleware)

// Wallet balance
router.get("/balance", walletController.getWalletBalance)

// Deposit
router.post("/deposit", validationMiddleware(DepositDto), walletController.deposit)
router.post("/deposit/confirm", validationMiddleware(ConfirmDepositDto), walletController.confirmDeposit)

// Withdrawal
router.post("/withdraw", validationMiddleware(WithdrawDto), walletController.withdraw)
router.post("/withdraw/confirm", validationMiddleware(ConfirmWithdrawalDto), walletController.confirmWithdrawal)

// Transfer
router.post("/transfer", validationMiddleware(TransferDto), walletController.transfer)
router.post("/transfer/confirm", validationMiddleware(ConfirmTransferDto), walletController.confirmTransfer)

// Transaction history
router.get("/transactions", walletController.getTransactionHistory)
router.get("/transactions/:id", walletController.getTransactionDetails)

export default router
