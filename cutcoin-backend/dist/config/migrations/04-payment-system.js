"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        // Create payments table
        await queryInterface.createTable("payments", {
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
            paymentMethod: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            amount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            cutcoinAmount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            reference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            externalReference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
                defaultValue: "pending",
            },
            metadata: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            merchantId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "merchants",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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
        // Create merchant_deposits table
        await queryInterface.createTable("merchant_deposits", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            merchantId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "merchants",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            studentId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            cashAmount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            cutcoinAmount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            reference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "approved", "rejected", "completed"),
                defaultValue: "pending",
            },
            notes: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            approvedBy: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "admins",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            approvedAt: {
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
        });
        // Add Paynow configuration to system_configs
        await queryInterface.bulkInsert("system_configs", [
            {
                key: "paynow_integration_id",
                value: "",
                description: "Paynow integration ID",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "paynow_integration_key",
                value: "",
                description: "Paynow integration key",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "paynow_return_url",
                value: "https://cutcoin.ac.zw/payment/return",
                description: "Paynow return URL",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "paynow_result_url",
                value: "https://api.cutcoin.ac.zw/api/payments/paynow/callback",
                description: "Paynow result URL",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "merchant_daily_deposit_limit",
                value: "1000",
                description: "Maximum daily deposit limit for merchants in USD",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "merchant_monthly_deposit_limit",
                value: "10000",
                description: "Maximum monthly deposit limit for merchants in USD",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.dropTable("merchant_deposits");
        await queryInterface.dropTable("payments");
        // Remove Paynow configuration from system_configs
        await queryInterface.bulkDelete("system_configs", {
            key: {
                [sequelize_1.Op.in]: [
                    "paynow_integration_id",
                    "paynow_integration_key",
                    "paynow_return_url",
                    "paynow_result_url",
                    "merchant_daily_deposit_limit",
                    "merchant_monthly_deposit_limit",
                ],
            },
        }, {});
    },
};
//# sourceMappingURL=04-payment-system.js.map