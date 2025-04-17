"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpException_1 = require("../exceptions/HttpException");
const user_model_1 = require("../models/user.model");
const authMiddleware = async (req, res, next) => {
    var _a;
    try {
        const Authorization = ((_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split("Bearer ")[1]) || null;
        if (!Authorization) {
            return next(new HttpException_1.HttpException(401, "Authentication token missing"));
        }
        const secretKey = process.env.JWT_SECRET || "your-secret-key";
        const verificationResponse = jsonwebtoken_1.default.verify(Authorization, secretKey);
        const userId = verificationResponse.id;
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            return next(new HttpException_1.HttpException(401, "Invalid authentication token"));
        }
        // Cast req to RequestWithUser to add the user property
        ;
        req.user = user;
        next();
    }
    catch (error) {
        next(new HttpException_1.HttpException(401, "Invalid authentication token"));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map