"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
const user_model_1 = require("./models/user.model");
const wallet_model_1 = require("./models/wallet.model");
const otp_model_1 = require("./models/otp.model");
const transaction_model_1 = require("./models/transaction.model");
const merchant_model_1 = require("./models/merchant.model");
const merchant_transaction_model_1 = require("./models/merchant-transaction.model");
const admin_model_1 = require("./models/admin.model");
const notification_model_1 = require("./models/notification.model");
const system_config_model_1 = require("./models/system-config.model");
const audit_log_model_1 = require("./models/audit-log.model");
const sequelize_1 = __importDefault(require("./config/sequelize"));
// Load environment variables
dotenv_1.default.config();
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
        this.initializeDatabase();
    }
    initializeMiddlewares() {
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)());
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    initializeRoutes() {
        this.app.use("/api", routes_1.default);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    async initializeDatabase() {
        try {
            // Add models
            sequelize_1.default.addModels([
                user_model_1.User,
                wallet_model_1.Wallet,
                otp_model_1.OTP,
                transaction_model_1.Transaction,
                merchant_model_1.Merchant,
                merchant_transaction_model_1.MerchantTransaction,
                admin_model_1.Admin,
                notification_model_1.Notification,
                system_config_model_1.SystemConfig,
                audit_log_model_1.AuditLog,
            ]);
            await sequelize_1.default.authenticate();
            console.log("Database connection has been established successfully.");
            // Sync database in development mode
            if (process.env.NODE_ENV === "development") {
                // await sequelize.sync({ alter: true })
                console.log("Database synchronized");
            }
        }
        catch (error) {
            console.error("Unable to connect to the database:", error);
        }
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map