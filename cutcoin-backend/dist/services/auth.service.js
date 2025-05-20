"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_model_1 = require("../models/user.model");
const otp_model_1 = require("../models/otp.model");
const wallet_model_1 = require("../models/wallet.model");
const generators_1 = require("../utils/generators");
const sms_1 = require("../utils/sms");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = require("../exceptions/HttpException");
const sequelize_1 = __importDefault(require("../config/sequelize"));
const sequelize_2 = require("sequelize"); // Import the Sequelize operators
class AuthService {
    async register(userData) {
        // Check if user already exists
        const existingUser = await user_model_1.User.findOne({
            where: {
                [sequelize_2.Op.or]: [{ studentId: userData.studentId }, { phoneNumber: userData.phoneNumber }],
            },
        });
        if (existingUser) {
            throw new HttpException_1.HttpException(409, "User already exists");
        }
        // Create user and wallet in a transaction
        const result = await sequelize_1.default.transaction(async (t) => {
            // Create user
            const user = await user_model_1.User.create(userData, { transaction: t });
            // Create wallet for user
            const walletAddress = (0, generators_1.generateWalletAddress)();
            await wallet_model_1.Wallet.create({
                userId: user.id,
                walletAddress,
                balance: 0,
            }, { transaction: t });
            // Generate and send OTP
            const otpCode = (0, generators_1.generateOTP)();
            await otp_model_1.OTP.create({
                userId: user.id,
                phoneNumber: userData.phoneNumber,
                code: otpCode,
                purpose: "registration",
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            }, { transaction: t });
            // Send OTP via SMS
            await (0, sms_1.sendSMS)(userData.phoneNumber, `Your CUTcoin verification code is: ${otpCode}. Valid for 10 minutes.`);
            return user;
        });
        return {
            message: "Registration successful. Please verify your phone number with the OTP sent.",
            userId: result.id,
        };
    }
    async verifyOTP(data) {
        const { phoneNumber, code, purpose } = data;
        // Find the OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                phoneNumber,
                code,
                purpose,
                isUsed: false,
                expiresAt: { [sequelize_2.Op.gt]: new Date() }, // Fix the $gt operator
            },
        });
        if (!otp) {
            throw new HttpException_1.HttpException(400, "Invalid or expired OTP");
        }
        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();
        // If registration OTP, update user KYC status
        if (purpose === "registration") {
            const user = await user_model_1.User.findByPk(otp.userId);
            if (user) {
                user.kycStatus = "verified";
                await user.save();
            }
        }
        return { verified: true };
    }
    async login(credentials) {
        // Find user by student ID
        const user = await user_model_1.User.findOne({
            where: { studentId: credentials.studentId },
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Validate PIN
        const isValidPin = await user.validatePin(credentials.pin);
        if (!isValidPin) {
            throw new HttpException_1.HttpException(401, "Invalid credentials");
        }
        // Check if KYC is verified
        if (user.kycStatus !== "verified") {
            throw new HttpException_1.HttpException(403, "Account not verified. Please complete KYC process.");
        }
        // Generate OTP for login
        const otpCode = (0, generators_1.generateOTP)();
        await otp_model_1.OTP.create({
            userId: user.id,
            phoneNumber: user.phoneNumber,
            code: otpCode,
            purpose: "login",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        await (0, sms_1.sendSMS)(user.phoneNumber, `Your CUTcoin login code is: ${otpCode}. Valid for 10 minutes.`);
        return {
            message: "OTP sent to your registered phone number",
            userId: user.id,
        };
    }
    async verifyLoginOTP(data) {
        const { studentId, code } = data;
        // Find user
        const user = await user_model_1.User.findOne({
            where: { studentId },
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Find the OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                userId: user.id,
                code,
                purpose: "login",
                isUsed: false,
                expiresAt: { [sequelize_2.Op.gt]: new Date() }, // Fix the $gt operator
            },
        });
        if (!otp) {
            throw new HttpException_1.HttpException(400, "Invalid or expired OTP");
        }
        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        // Generate JWT token
        const token = this.generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                studentId: user.studentId,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                kycStatus: user.kycStatus,
            },
        };
    }
    async requestPasswordReset(data) {
        // Find user
        const user = await user_model_1.User.findOne({
            where: {
                studentId: data.studentId,
                phoneNumber: data.phoneNumber,
            },
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Generate OTP
        const otpCode = (0, generators_1.generateOTP)();
        await otp_model_1.OTP.create({
            userId: user.id,
            phoneNumber: user.phoneNumber,
            code: otpCode,
            purpose: "password_reset",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
        await (0, sms_1.sendSMS)(user.phoneNumber, `Your CUTcoin PIN reset code is: ${otpCode}. Valid for 10 minutes.`);
        return {
            message: "OTP sent to your registered phone number",
            userId: user.id,
        };
    }
    async resetPin(data) {
        const { studentId, code, newPin } = data;
        // Find user
        const user = await user_model_1.User.findOne({
            where: { studentId },
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Find the OTP
        const otp = await otp_model_1.OTP.findOne({
            where: {
                userId: user.id,
                code,
                purpose: "password_reset",
                isUsed: false,
                expiresAt: { [sequelize_2.Op.gt]: new Date() }, // Fix the $gt operator
            },
        });
        if (!otp) {
            throw new HttpException_1.HttpException(400, "Invalid or expired OTP");
        }
        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();
        // Update PIN
        user.pin = newPin;
        await user.save();
        return { message: "PIN reset successful" };
    }
    async completeKYC(userId, kycData) {
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Update KYC data
        user.kycData = kycData;
        user.kycStatus = "pending";
        await user.save();
        return {
            message: "KYC information submitted successfully. Pending verification.",
            kycStatus: user.kycStatus,
        };
    }
    generateToken(user) {
        const secretKey = process.env.JWT_SECRET || "your-secret-key";
        const expiresIn = "24h";
        return jsonwebtoken_1.default.sign({
            id: user.id,
            studentId: user.studentId,
        }, secretKey, { expiresIn });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map