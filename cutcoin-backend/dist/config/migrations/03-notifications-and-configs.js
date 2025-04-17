"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        // Create notifications table
        await queryInterface.createTable("notifications", {
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
            type: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            title: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: false,
            },
            data: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            isRead: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            isSent: {
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
        // Create system_configs table
        await queryInterface.createTable("system_configs", {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            key: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            value: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
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
        // Create audit_logs table
        await queryInterface.createTable("audit_logs", {
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
                onDelete: "SET NULL",
            },
            adminId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "admins",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            action: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            entity: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            entityId: {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
            },
            oldValues: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            newValues: {
                type: sequelize_1.DataTypes.JSONB,
                allowNull: true,
            },
            ipAddress: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
            },
            userAgent: {
                type: sequelize_1.DataTypes.STRING,
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
        // Insert default system configurations
        await queryInterface.bulkInsert("system_configs", [
            {
                key: "exchange_rate",
                value: "100",
                description: "Exchange rate: 1 USD = X CUTcoins",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "max_wallet_balance",
                value: "50000",
                description: "Maximum wallet balance in CUTcoins",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "daily_transaction_limit",
                value: "10000",
                description: "Daily transaction limit in CUTcoins",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "monthly_withdrawal_limit",
                value: "30000",
                description: "Monthly withdrawal limit in CUTcoins",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "transfer_fee_threshold",
                value: "1000",
                description: "Threshold above which transfer fees apply",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "transfer_fee_percentage",
                value: "0.5",
                description: "Fee percentage for transfers above threshold",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "withdrawal_fee_threshold",
                value: "2000",
                description: "Threshold above which withdrawal fees apply",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                key: "withdrawal_fee_percentage",
                value: "1",
                description: "Fee percentage for withdrawals above threshold",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.dropTable("audit_logs");
        await queryInterface.dropTable("system_configs");
        await queryInterface.dropTable("notifications");
    },
};
//# sourceMappingURL=03-notifications-and-configs.js.map