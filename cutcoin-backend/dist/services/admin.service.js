"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const admin_model_1 = require("../models/admin.model");
const user_model_1 = require("../models/user.model");
const merchant_model_1 = require("../models/merchant.model");
const transaction_model_1 = require("../models/transaction.model");
const wallet_model_1 = require("../models/wallet.model");
const system_config_model_1 = require("../models/system-config.model");
const audit_log_model_1 = require("../models/audit-log.model");
const HttpException_1 = require("../exceptions/HttpException");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../config/sequelize"));
class AdminService {
    async login(credentials) {
        // Find admin by username
        const admin = await admin_model_1.Admin.findOne({
            where: { username: credentials.username },
        });
        if (!admin) {
            throw new HttpException_1.HttpException(404, "Admin not found");
        }
        // Validate password
        const isValidPassword = await admin.validatePassword(credentials.password);
        if (!isValidPassword) {
            throw new HttpException_1.HttpException(401, "Invalid credentials");
        }
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        // Generate JWT token
        const token = this.generateToken(admin);
        return {
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                fullName: admin.fullName,
                role: admin.role,
            },
        };
    }
    async createAdmin(adminData) {
        // Check if admin already exists
        const existingAdmin = await admin_model_1.Admin.findOne({
            where: {
                [sequelize_1.Op.or]: [{ username: adminData.username }, { email: adminData.email }],
            },
        });
        if (existingAdmin) {
            throw new HttpException_1.HttpException(409, "Admin already exists");
        }
        // Create admin
        const admin = await admin_model_1.Admin.create(adminData);
        return {
            message: "Admin created successfully",
            adminId: admin.id,
        };
    }
    async getAdminProfile(adminId) {
        const admin = await admin_model_1.Admin.findByPk(adminId, {
            attributes: { exclude: ["password"] },
        });
        if (!admin) {
            throw new HttpException_1.HttpException(404, "Admin not found");
        }
        return admin;
    }
    async updateAdminProfile(adminId, adminData) {
        const admin = await admin_model_1.Admin.findByPk(adminId);
        if (!admin) {
            throw new HttpException_1.HttpException(404, "Admin not found");
        }
        // Update admin data
        await admin.update(adminData);
        return {
            message: "Admin profile updated successfully",
            admin: {
                id: admin.id,
                username: admin.username,
                fullName: admin.fullName,
                email: admin.email,
                phoneNumber: admin.phoneNumber,
                role: admin.role,
            },
        };
    }
    async getAllUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (query.search) {
            whereClause[sequelize_1.Op.or] = [
                { studentId: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { firstName: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { lastName: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { phoneNumber: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
            ];
        }
        if (query.status) {
            whereClause.kycStatus = query.status;
        }
        const { count, rows } = await user_model_1.User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: wallet_model_1.Wallet,
                    attributes: ["balance", "walletAddress"],
                },
            ],
        });
        return {
            users: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    async getUserDetails(userId) {
        const user = await user_model_1.User.findByPk(userId, {
            include: [
                {
                    model: wallet_model_1.Wallet,
                    attributes: ["balance", "walletAddress"],
                },
            ],
        });
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Get user transactions
        const transactions = await transaction_model_1.Transaction.findAll({
            where: {
                [sequelize_1.Op.or]: [{ senderId: userId }, { receiverId: userId }],
            },
            limit: 10,
            order: [["createdAt", "DESC"]],
        });
        return {
            user,
            transactions,
        };
    }
    async updateUserStatus(userId, data) {
        const user = await user_model_1.User.findByPk(userId);
        if (!user) {
            throw new HttpException_1.HttpException(404, "User not found");
        }
        // Update user status
        await user.update(data);
        return {
            message: "User status updated successfully",
            user: {
                id: user.id,
                studentId: user.studentId,
                firstName: user.firstName,
                lastName: user.lastName,
                kycStatus: user.kycStatus,
                isActive: user.isActive,
            },
        };
    }
    async getAllMerchants(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (query.search) {
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { location: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { contactPerson: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
                { contactPhone: { [sequelize_1.Op.iLike]: `%${query.search}%` } },
            ];
        }
        if (query.status) {
            whereClause.status = query.status;
        }
        const { count, rows } = await merchant_model_1.Merchant.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
                },
            ],
        });
        return {
            merchants: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    async getMerchantDetails(merchantId) {
        const merchant = await merchant_model_1.Merchant.findByPk(merchantId, {
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
                    include: [
                        {
                            model: wallet_model_1.Wallet,
                            attributes: ["balance", "walletAddress"],
                        },
                    ],
                },
            ],
        });
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found");
        }
        // Get merchant transactions
        const transactions = await transaction_model_1.Transaction.findAll({
            where: {
                receiverId: merchant.user.id,
                type: "payment",
            },
            limit: 10,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    as: "sender",
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        return {
            merchant,
            transactions,
        };
    }
    async updateMerchantStatus(merchantId, data) {
        const merchant = await merchant_model_1.Merchant.findByPk(merchantId);
        if (!merchant) {
            throw new HttpException_1.HttpException(404, "Merchant not found");
        }
        // Update merchant status
        await merchant.update(data);
        return {
            message: "Merchant status updated successfully",
            merchant: {
                id: merchant.id,
                name: merchant.name,
                status: merchant.status,
                isActive: merchant.isActive,
            },
        };
    }
    async getSystemStats() {
        // Get total users
        const totalUsers = await user_model_1.User.count();
        // Get total merchants
        const totalMerchants = await merchant_model_1.Merchant.count();
        // Get total transactions
        const totalTransactions = await transaction_model_1.Transaction.count();
        // Get total transaction volume
        const transactionVolume = await transaction_model_1.Transaction.sum("amount");
        // Get recent transactions
        const recentTransactions = await transaction_model_1.Transaction.findAll({
            limit: 10,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    as: "sender",
                    attributes: ["studentId", "firstName", "lastName"],
                },
                {
                    model: user_model_1.User,
                    as: "receiver",
                    attributes: ["studentId", "firstName", "lastName"],
                },
            ],
        });
        // Get user registration stats (last 7 days)
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const userRegistrations = await user_model_1.User.findAll({
            attributes: [
                [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "date"],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
            ],
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: lastWeek,
                },
            },
            group: [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt"))],
            order: [[sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "ASC"]],
            raw: true,
        });
        // Get transaction stats (last 7 days)
        const transactionStats = await transaction_model_1.Transaction.findAll({
            attributes: [
                [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "date"],
                [sequelize_2.default.fn("count", sequelize_2.default.col("id")), "count"],
                [sequelize_2.default.fn("sum", sequelize_2.default.col("amount")), "volume"],
            ],
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: lastWeek,
                },
            },
            group: [sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt"))],
            order: [[sequelize_2.default.fn("date_trunc", "day", sequelize_2.default.col("createdAt")), "ASC"]],
            raw: true,
        });
        return {
            totalUsers,
            totalMerchants,
            totalTransactions,
            transactionVolume,
            recentTransactions,
            userRegistrations,
            transactionStats,
        };
    }
    async getSystemConfig() {
        const configs = await system_config_model_1.SystemConfig.findAll({
            where: { isActive: true },
        });
        // Convert to key-value object
        const configObject = {};
        configs.forEach((config) => {
            configObject[config.key] = config.value;
        });
        return configObject;
    }
    async updateSystemConfig(configData) {
        const { key, value, description } = configData;
        // Find or create config
        const [config, created] = await system_config_model_1.SystemConfig.findOrCreate({
            where: { key },
            defaults: {
                value,
                description: description || "",
                isActive: true,
            },
        });
        if (!created) {
            // Update existing config
            await config.update({
                value,
                description: description || config.description,
            });
        }
        return {
            message: `System config ${key} updated successfully`,
            config,
        };
    }
    async getAuditLogs(query) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const whereClause = {};
        if (query.entity) {
            whereClause.entity = query.entity;
        }
        if (query.action) {
            whereClause.action = query.action;
        }
        const { count, rows } = await audit_log_model_1.AuditLog.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: user_model_1.User,
                    attributes: ["studentId", "firstName", "lastName"],
                },
                {
                    model: admin_model_1.Admin,
                    attributes: ["username", "fullName"],
                },
            ],
        });
        return {
            logs: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit),
            },
        };
    }
    generateToken(admin) {
        const secretKey = process.env.JWT_SECRET || "your-secret-key";
        const expiresIn = "24h";
        return jsonwebtoken_1.default.sign({
            id: admin.id,
            username: admin.username,
            role: admin.role,
            isAdmin: true,
        }, secretKey, { expiresIn });
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map