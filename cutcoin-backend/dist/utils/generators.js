"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMerchantNumber = exports.generateTransactionReference = exports.generateWalletAddress = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const merchant_model_1 = require("../models/merchant.model");
const generateOTP = (length = 6) => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const generateWalletAddress = () => {
    // Generate a random wallet address with CUT prefix
    const randomBytes = crypto_1.default.randomBytes(16).toString("hex");
    return `CUT${randomBytes}`;
};
exports.generateWalletAddress = generateWalletAddress;
const generateTransactionReference = () => {
    // Generate a unique transaction reference
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    return `TXN${timestamp}${random}`;
};
exports.generateTransactionReference = generateTransactionReference;
const generateMerchantNumber = async () => {
    // Generate a unique merchant number with MERCH prefix
    // Format: MERCH-XXXXX (where X is a digit)
    let isUnique = false;
    let merchantNumber = "";
    while (!isUnique) {
        const random = Math.floor(10000 + Math.random() * 90000).toString(); // 5-digit number
        merchantNumber = `MERCH-${random}`;
        // Check if this merchant number already exists
        const existingMerchant = await merchant_model_1.Merchant.findOne({ where: { merchantNumber } });
        if (!existingMerchant) {
            isUnique = true;
        }
    }
    return merchantNumber;
};
exports.generateMerchantNumber = generateMerchantNumber;
//# sourceMappingURL=generators.js.map