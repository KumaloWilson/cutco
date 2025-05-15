import { Router } from "express"
import { WalletController } from "../controllers/wallet.controller"
import { authMiddleware } from "../middlewares/auth.middleware"
import { validationMiddleware } from "../middlewares/validation.middleware"
import {
  InitiateDepositDto,
  MerchantConfirmTransactionDto,
  CancelTransactionDto,
  InitiateWithdrawalDto,
  ConfirmWithdrawalOtpDto,
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
router.post("/deposit/initiate", validationMiddleware(InitiateDepositDto), walletController.initiateDeposit)


// Withdrawal
router.post("/withdraw/initiate", validationMiddleware(InitiateWithdrawalDto), walletController.initiateWithdrawal)

router.post(
  "/withdraw/confirm-otp",
  validationMiddleware(ConfirmWithdrawalOtpDto),
  walletController.confirmWithdrawalOTP,
)

// Cancel transaction
router.post(
  "/transaction/cancel",
  validationMiddleware(CancelTransactionDto),
  walletController.cancelMerchantTransaction,
)

// Pending transactions
router.get("/merchant/pending-transactions", walletController.getMerchantPendingTransactions)
router.get("/pending-transactions", walletController.getUserPendingTransactions)

// Transfer
router.post("/transfer", validationMiddleware(TransferDto), walletController.transfer)
router.post("/transfer/confirm", validationMiddleware(ConfirmTransferDto), walletController.confirmTransfer)

// Transaction history
router.get("/transactions", walletController.getUserTransactionHistory)
router.get("/transactions/:id", walletController.getTransactionDetails)

export default router
