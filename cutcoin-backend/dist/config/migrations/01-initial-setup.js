"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        // Create users table
        await queryInterface.createTable("users", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            studentId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            phoneNumber: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            pin: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            firstName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            lastName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            kycStatus: {
                type: sequelize_1.DataTypes.ENUM("pending", "verified", "rejected"),
                defaultValue: "pending",
            },
            kycData: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            deviceId: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            fcmToken: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
            },
            lastLogin: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            deletedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
        });
        // Create wallets table
        await queryInterface.createTable("wallets", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            balance: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
                defaultValue: 0,
            },
            walletAddress: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            isActive: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: true,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
        // Create otps table
        await queryInterface.createTable("otps", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            phoneNumber: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            code: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            purpose: {
                type: sequelize_1.DataTypes.ENUM("registration", "login", "transaction", "password_reset"),
                allowNull: false,
            },
            expiresAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            isUsed: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
        // Create transactions table
        await queryInterface.createTable("transactions", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            senderId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            receiverId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            amount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            type: {
                type: sequelize_1.DataTypes.ENUM("deposit", "withdrawal", "transfer", "payment"),
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
                defaultValue: "pending",
            },
            reference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            fee: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
        });
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.dropTable("transactions");
        await queryInterface.dropTable("otps");
        await queryInterface.dropTable("wallets");
        await queryInterface.dropTable("users");
    },
};
//# sourceMappingURL=01-initial-setup.js.map