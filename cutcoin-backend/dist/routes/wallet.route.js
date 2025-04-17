"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("../controllers/wallet.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const wallet_dto_1 = require("../dtos/wallet.dto");
const router = (0, express_1.Router)();
const walletController = new wallet_controller_1.WalletController();
// All wallet routes require authentication
router.use(auth_middleware_1.authMiddleware);
// Wallet balance
router.get("/balance", walletController.getWalletBalance);
// Deposit
router.post("/deposit/initiate", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.InitiateDepositDto), walletController.initiateDeposit);
router.post("/deposit/merchant-confirm", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.MerchantConfirmTransactionDto), walletController.merchantConfirmDeposit);
// Withdrawal
router.post("/withdraw/initiate", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.InitiateWithdrawalDto), walletController.initiateWithdrawal);
router.post("/withdraw/confirm-otp", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.ConfirmWithdrawalOtpDto), walletController.confirmWithdrawalOTP);
router.post("/withdraw/merchant-confirm", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.MerchantConfirmTransactionDto), walletController.merchantConfirmWithdrawal);
// Cancel transaction
router.post("/transaction/cancel", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.CancelTransactionDto), walletController.cancelMerchantTransaction);
// Pending transactions
router.get("/merchant/pending-transactions", walletController.getMerchantPendingTransactions);
router.get("/pending-transactions", walletController.getUserPendingTransactions);
// Transfer
router.post("/transfer", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.TransferDto), walletController.transfer);
router.post("/transfer/confirm", (0, validation_middleware_1.validationMiddleware)(wallet_dto_1.ConfirmTransferDto), walletController.confirmTransfer);
// Transaction history
router.get("/transactions", walletController.getTransactionHistory);
router.get("/transactions/:id", walletController.getTransactionDetails);
exports.default = router;
//# sourceMappingURL=wallet.route.js.map