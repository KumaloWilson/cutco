import type { Request, Response, NextFunction } from "express"
import winston from "winston"
import { AuditLog } from "../models/audit-log.model"
import type { RequestWithUser } from "./auth.middleware"
import type { RequestWithAdmin } from "./admin.middleware"

// Create Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  defaultMeta: { service: "cutcoin-api" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
})

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start

    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    })
  })

  next()
}

// Audit logger middleware
export const auditLogger = async (
  req: RequestWithUser | RequestWithAdmin,
  entity: string,
  action: string,
  entityId?: number,
  oldValues?: any,
  newValues?: any,
) => {
  try {
    const userId = (req as RequestWithUser).user?.id
    const adminId = (req as RequestWithAdmin).admin?.id

    await AuditLog.create({
      userId,
      adminId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    })
  } catch (error) {
    logger.error("Failed to create audit log", { error })
  }
}

// Error logger
export const errorLogger = (error: Error) => {
  logger.error({
    message: error.message,
    stack: error.stack,
  })
}
