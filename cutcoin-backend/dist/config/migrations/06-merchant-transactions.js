"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        // Create merchant_transactions table
        await queryInterface.createTable("merchant_transactions", {
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
            type: {
                type: sequelize_1.DataTypes.ENUM("deposit", "withdrawal"),
                allowNull: false,
            },
            amount: {
                type: sequelize_1.DataTypes.DECIMAL(20, 2),
                allowNull: false,
            },
            fee: {
                type: sequelize_1.DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0,
            },
            reference: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            status: {
                type: sequelize_1.DataTypes.ENUM("pending", "completed", "cancelled", "rejected"),
                defaultValue: "pending",
            },
            description: {
                type: sequelize_1.DataTypes.TEXT,
                allowNull: true,
            },
            studentConfirmed: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            merchantConfirmed: {
                type: sequelize_1.DataTypes.BOOLEAN,
                defaultValue: false,
            },
            completedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: true,
            },
            cancelledAt: {
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
        // Add index for faster lookups
        await queryInterface.addIndex("merchant_transactions", ["reference"]);
        await queryInterface.addIndex("merchant_transactions", ["userId", "status"]);
        await queryInterface.addIndex("merchant_transactions", ["merchantId", "status"]);
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.dropTable("merchant_transactions");
    },
};
//# sourceMappingURL=06-merchant-transactions.js.map