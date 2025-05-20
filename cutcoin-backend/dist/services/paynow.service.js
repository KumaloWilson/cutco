"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paynow_1 = require("paynow");
class PaynowService {
    constructor() {
        const integrationId = process.env.PAYNOW_INTEGRATION_ID || "";
        const integrationKey = process.env.PAYNOW_INTEGRATION_KEY || "";
        const returnUrl = process.env.PAYNOW_RETURN_URL || "http://localhost:3000/payment/return";
        const resultUrl = process.env.PAYNOW_RESULT_URL || "http://localhost:5000/api/payments/update";
        this.paynow = new paynow_1.Paynow(integrationId, integrationKey);
        this.paynow.resultUrl = resultUrl;
        this.paynow.returnUrl = returnUrl;
    }
    async initiateTransaction(email, phone, amount, reference, description) {
        try {
            // Create payment - use merchant email in test mode
            const isTestMode = process.env.NODE_ENV !== 'production';
            const paymentEmail = isTestMode
                ? process.env.MERCHANT_EMAIL || '' // Add this to your env variables
                : email;
            const payment = this.paynow.createPayment(reference, paymentEmail);
            // Add payment details
            payment.add(description, amount);
            // // Set up mobile payment if phone is provided
            // if (phone) {
            //   payment.setPhone(phone);
            // }
            // Send payment to Paynow
            const response = await this.paynow.send(payment);
            //logger.info(`Initiating Paynow transaction: ${JSON.stringify(response)}`);
            // Check if payment initiation was successful
            if (response.success) {
                return {
                    status: "success",
                    pollUrl: response.pollUrl,
                    redirectUrl: response.redirectUrl || response.pollUrl,
                    transactionReference: reference,
                };
            }
            else {
                //logger.error("Paynow payment error:", response.error);
                return {
                    status: "error",
                    error: response.error || "Payment initiation failed",
                    transactionReference: reference,
                };
            }
        }
        catch (error) {
            //logger.error("Error initiating Paynow transaction:", error);
            throw new Error(`Failed to initiate Paynow transaction: ${error.message}`);
        }
    }
    async checkTransactionStatus(pollUrl) {
        try {
            const status = await this.paynow.pollTransaction(pollUrl);
            return {
                status: status.status,
                amount: status.amount,
                reference: status.reference,
                paynowReference: status.paynowReference,
                paid: status.paid,
            };
        }
        catch (error) {
            //logger.error("Error checking Paynow transaction status:", error);
            throw new Error(`Failed to check transaction status: ${error.message}`);
        }
    }
}
exports.default = new PaynowService();
//# sourceMappingURL=paynow.service.js.map