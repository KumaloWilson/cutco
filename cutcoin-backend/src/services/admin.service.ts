import { Admin } from "../models/admin.model"
import { User } from "../models/user.model"
import { Merchant } from "../models/merchant.model"
import { Transaction } from "../models/transaction.model"
import { Wallet } from "../models/wallet.model"
import { SystemConfig } from "../models/system-config.model"
import { AuditLog } from "../models/audit-log.model"
import { HttpException } from "../exceptions/HttpException"
import jwt from "jsonwebtoken"
import { Op } from "sequelize"
import { sequelize } from "../db/sequelize"

export class AdminService {
  public async login(credentials: { username: string; password: string }) {
    // Find admin by username
    const admin = await Admin.findOne({
      where: { username: credentials.username },
    })

    if (!admin) {
      throw new HttpException(404, "Admin not found")
    }

    // Validate password
    const isValidPassword = await admin.validatePassword(credentials.password)
    if (!isValidPassword) {
      throw new HttpException(401, "Invalid credentials")
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Generate JWT token
    const token = this.generateToken(admin)

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.fullName,
        role: admin.role,
      },
    }
  }

  public async createAdmin(adminData: {
    username: string
    password: string
    fullName: string
    email: string
    phoneNumber: string
    role: string
  }) {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: {
        [Op.or]: [{ username: adminData.username }, { email: adminData.email }],
      },
    })

    if (existingAdmin) {
      throw new HttpException(409, "Admin already exists")
    }

    // Create admin
    const admin = await Admin.create(adminData)

    return {
      message: "Admin created successfully",
      adminId: admin.id,
    }
  }

  public async getAdminProfile(adminId: number) {
    const admin = await Admin.findByPk(adminId, {
      attributes: { exclude: ["password"] },
    })

    if (!admin) {
      throw new HttpException(404, "Admin not found")
    }

    return admin
  }

  public async updateAdminProfile(
    adminId: number,
    adminData: {
      fullName?: string
      email?: string
      phoneNumber?: string
      password?: string
    },
  ) {
    const admin = await Admin.findByPk(adminId)
    if (!admin) {
      throw new HttpException(404, "Admin not found")
    }

    // Update admin data
    await admin.update(adminData)

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
    }
  }

  public async getAllUsers(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {}

    if (query.search) {
      whereClause[Op.or] = [
        { studentId: { [Op.iLike]: `%${query.search}%` } },
        { firstName: { [Op.iLike]: `%${query.search}%` } },
        { lastName: { [Op.iLike]: `%${query.search}%` } },
        { phoneNumber: { [Op.iLike]: `%${query.search}%` } },
      ]
    }

    if (query.status) {
      whereClause.kycStatus = query.status
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Wallet,
          attributes: ["balance", "walletAddress"],
        },
      ],
    })

    return {
      users: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  public async getUserDetails(userId: number) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Wallet,
          attributes: ["balance", "walletAddress"],
        },
      ],
    })

    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Get user transactions
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
    })

    return {
      user,
      transactions,
    }
  }

  public async updateUserStatus(userId: number, data: { kycStatus: string; isActive: boolean }) {
    const user = await User.findByPk(userId)
    if (!user) {
      throw new HttpException(404, "User not found")
    }

    // Update user status
    await user.update(data)

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
    }
  }

  public async getAllMerchants(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {}

    if (query.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query.search}%` } },
        { location: { [Op.iLike]: `%${query.search}%` } },
        { contactPerson: { [Op.iLike]: `%${query.search}%` } },
        { contactPhone: { [Op.iLike]: `%${query.search}%` } },
      ]
    }

    if (query.status) {
      whereClause.status = query.status
    }

    const { count, rows } = await Merchant.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName", "phoneNumber"],
        },
      ],
    })

    return {
      merchants: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  public async getMerchantDetails(merchantId: number) {
    const merchant = await Merchant.findByPk(merchantId, {
      include: [
        {
          model: User,
          attributes: ["id", "studentId", "firstName", "lastName", "phoneNumber"],
          include: [
            {
              model: Wallet,
              attributes: ["balance", "walletAddress"],
            },
          ],
        },
      ],
    })

    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Get merchant transactions
    const transactions = await Transaction.findAll({
      where: {
        receiverId: merchant.user.id,
        type: "payment",
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    return {
      merchant,
      transactions,
    }
  }

  public async updateMerchantStatus(merchantId: number, data: { status: string; isActive: boolean }) {
    const merchant = await Merchant.findByPk(merchantId)
    if (!merchant) {
      throw new HttpException(404, "Merchant not found")
    }

    // Update merchant status
    await merchant.update(data)

    return {
      message: "Merchant status updated successfully",
      merchant: {
        id: merchant.id,
        name: merchant.name,
        status: merchant.status,
        isActive: merchant.isActive,
      },
    }
  }

  public async getSystemStats() {
    // Get total users
    const totalUsers = await User.count()

    // Get total merchants
    const totalMerchants = await Merchant.count()

    // Get total transactions
    const totalTransactions = await Transaction.count()

    // Get total transaction volume
    const transactionVolume = await Transaction.sum("amount")

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      limit: 10,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["studentId", "firstName", "lastName"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["studentId", "firstName", "lastName"],
        },
      ],
    })

    // Get user registration stats (last 7 days)
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const userRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "date"],
        [sequelize.fn("count", sequelize.col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: lastWeek,
        },
      },
      group: [sequelize.fn("date_trunc", "day", sequelize.col("createdAt"))],
      order: [[sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    })

    // Get transaction stats (last 7 days)
    const transactionStats = await Transaction.findAll({
      attributes: [
        [sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "date"],
        [sequelize.fn("count", sequelize.col("id")), "count"],
        [sequelize.fn("sum", sequelize.col("amount")), "volume"],
      ],
      where: {
        createdAt: {
          [Op.gte]: lastWeek,
        },
      },
      group: [sequelize.fn("date_trunc", "day", sequelize.col("createdAt"))],
      order: [[sequelize.fn("date_trunc", "day", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    })

    return {
      totalUsers,
      totalMerchants,
      totalTransactions,
      transactionVolume,
      recentTransactions,
      userRegistrations,
      transactionStats,
    }
  }

  public async getSystemConfig() {
    const configs = await SystemConfig.findAll({
      where: { isActive: true },
    })

    // Convert to key-value object
    const configObject: { [key: string]: string } = {}
    configs.forEach((config) => {
      configObject[config.key] = config.value
    })

    return configObject
  }

  public async updateSystemConfig(configData: { key: string; value: string; description?: string }) {
    const { key, value, description } = configData

    // Find or create config
    const [config, created] = await SystemConfig.findOrCreate({
      where: { key },
      defaults: {
        value,
        description: description || "",
        isActive: true,
      },
    })

    if (!created) {
      // Update existing config
      await config.update({
        value,
        description: description || config.description,
      })
    }

    return {
      message: `System config ${key} updated successfully`,
      config,
    }
  }

  public async getAuditLogs(query: { page?: number; limit?: number; entity?: string; action?: string }) {
    const page = query.page || 1
    const limit = query.limit || 10
    const offset = (page - 1) * limit

    const whereClause: any = {}

    if (query.entity) {
      whereClause.entity = query.entity
    }

    if (query.action) {
      whereClause.action = query.action
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["studentId", "firstName", "lastName"],
        },
        {
          model: Admin,
          attributes: ["username", "fullName"],
        },
      ],
    })

    return {
      logs: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    }
  }

  private generateToken(admin: Admin): string {
    const secretKey = process.env.JWT_SECRET || "your-secret-key"
    const expiresIn = "24h"

    return jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        isAdmin: true,
      },
      secretKey,
      { expiresIn },
    )
  }
}
