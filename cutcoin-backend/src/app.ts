import express, { type Application } from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import routes from "./routes"
import { errorHandler } from "./middlewares/errorHandler"
import { User } from "./models/user.model"
import { Wallet } from "./models/wallet.model"
import { OTP } from "./models/otp.model"
import { Transaction } from "./models/transaction.model"
import { Merchant } from "./models/merchant.model"
import { MerchantTransaction } from "./models/merchant-transaction.model"
import { Admin } from "./models/admin.model"
import { Notification } from "./models/notification.model"
import { SystemConfig } from "./models/system-config.model"
import { AuditLog } from "./models/audit-log.model"
import sequelize from "./config/sequelize"

// Load environment variables
dotenv.config()

class App {
  public app: Application

  constructor() {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeRoutes()
    this.initializeErrorHandling()
    this.initializeDatabase()
  }

  private initializeMiddlewares() {
    this.app.use(helmet())
    this.app.use(cors())
    this.app.use(morgan("dev"))
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private initializeRoutes() {
    this.app.use("/api", routes)
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler)
  }

  private async initializeDatabase() {
    try {
      // Add models
      sequelize.addModels([
        User,
        Wallet,
        OTP,
        Transaction,
        Merchant,
        MerchantTransaction,
        Admin,
        Notification,
        SystemConfig,
        AuditLog,
      ])

      await sequelize.authenticate()
      console.log("Database connection has been established successfully.")

      // Sync database in development mode
      if (process.env.NODE_ENV === "development") {
        // await sequelize.sync({ alter: true })
        console.log("Database synchronized")
      }
    } catch (error) {
      console.error("Unable to connect to the database:", error)
    }
  }
}

export default new App().app
