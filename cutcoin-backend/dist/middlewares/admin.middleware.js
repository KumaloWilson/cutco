"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminMiddleware = exports.adminMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = require("../exceptions/HttpException");
const admin_model_1 = require("../models/admin.model");
const adminMiddleware = async (req, res, next) => {
    var _a;
    try {
        const Authorization = ((_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1]) || null;
        if (!Authorization) {
            return next(new HttpException_1.HttpException(401, "Authentication token missing"));
        }
        const secretKey = process.env.JWT_SECRET || "your-secret-key";
        const verificationResponse = jsonwebtoken_1.default.verify(Authorization, secretKey);
        if (!verificationResponse.isAdmin) {
            return next(new HttpException_1.HttpException(403, "Unauthorized: Admin access required"));
        }
        const adminId = verificationResponse.id;
        const admin = await admin_model_1.Admin.findByPk(adminId);
        if (!admin) {
            return next(new HttpException_1.HttpException(401, "Invalid authentication token"));
        }
        if (!admin.isActive) {
            return next(new HttpException_1.HttpException(403, "Admin account is inactive"));
        }
        // Cast req to RequestWithAdmin to add the admin property
        ;
        req.admin = admin;
        next();
    }
    catch (error) {
        next(new HttpException_1.HttpException(401, "Invalid authentication token"));
    }
};
exports.adminMiddleware = adminMiddleware;
const superAdminMiddleware = async (req, res, next) => {
    try {
        if (!req.admin) {
            return next(new HttpException_1.HttpException(401, "Authentication required"));
        }
        if (req.admin.role !== "super_admin") {
            return next(new HttpException_1.HttpException(403, "Unauthorized: Super admin access required"));
        }
        next();
    }
    catch (error) {
        next(new HttpException_1.HttpException(401, "Invalid authentication token"));
    }
};
exports.superAdminMiddleware = superAdminMiddleware;
//# sourceMappingURL=admin.middleware.js.map