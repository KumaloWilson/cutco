"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const HttpException_1 = require("../exceptions/HttpException");
// Create Redis client
// const redisClient = new Redis({
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   password: process.env.REDIS_PASSWORD,
// })
// General API rate limiter
exports.apiLimiter = (0, express_rate_limit_1.default)({
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redisClient.call(...args),
    // }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        next(new HttpException_1.HttpException(429, "Too many requests, please try again later."));
    },
});
// Authentication rate limiter (more strict)
exports.authLimiter = (0, express_rate_limit_1.default)({
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redisClient.call(...args),
    // }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        next(new HttpException_1.HttpException(429, "Too many login attempts, please try again later."));
    },
});
// Transaction rate limiter
exports.transactionLimiter = (0, express_rate_limit_1.default)({
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redisClient.call(...args),
    // }),
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // limit each IP to 50 transaction requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        next(new HttpException_1.HttpException(429, "Too many transaction requests, please try again later."));
    },
});
//# sourceMappingURL=rate-limiter.middleware.js.map