"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.auditLogger = exports.requestLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const audit_log_model_1 = require("../models/audit-log.model");
// Create Winston logger
const logger = winston_1.default.createLogger({
    level: "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    defaultMeta: { service: "cutcoin-api" },
    transports: [
        new winston_1.default.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston_1.default.transports.File({ filename: "logs/combined.log" }),
    ],
});
// Add console transport in development
if (process.env.NODE_ENV !== "production") {
    logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
    }));
}
// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get("user-agent"),
        });
    });
    next();
};
exports.requestLogger = requestLogger;
// Audit logger middleware
const auditLogger = async (req, entity, action, entityId, oldValues, newValues) => {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const adminId = (_b = req.admin) === null || _b === void 0 ? void 0 : _b.id;
        await audit_log_model_1.AuditLog.create({
            userId,
            adminId,
            action,
            entity,
            entityId,
            oldValues,
            newValues,
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
        });
    }
    catch (error) {
        logger.error("Failed to create audit log", { error });
    }
};
exports.auditLogger = auditLogger;
// Error logger
const errorLogger = (error) => {
    logger.error({
        message: error.message,
        stack: error.stack,
    });
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logger.middleware.js.map