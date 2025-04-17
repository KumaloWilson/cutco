"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
        this.register = async (req, res, next) => {
            try {
                const userData = req.body;
                console.log("User data:", userData);
                const result = await this.authService.register(userData);
                res.status(201).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyOTP = async (req, res, next) => {
            try {
                const result = await this.authService.verifyOTP(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyLoginOTP = async (req, res, next) => {
            try {
                const result = await this.authService.verifyLoginOTP(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.requestPasswordReset = async (req, res, next) => {
            try {
                const result = await this.authService.requestPasswordReset(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.resetPin = async (req, res, next) => {
            try {
                const result = await this.authService.resetPin(req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.completeKYC = async (req, res, next) => {
            try {
                if (!req.user || !req.user.id) {
                    res.status(401).json({ message: "Unauthorized" });
                    return; // Just return without the Response object
                }
                const userId = req.user.id;
                const result = await this.authService.completeKYC(userId, req.body);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map