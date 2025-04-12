import { type QueryInterface, DataTypes, type Sequelize } from "sequelize"

module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // Create payments table
    await queryInterface.createTable("payments", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      cutcoinAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      externalReference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
        defaultValue: "pending",
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "merchants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    })

    // Create merchant_deposits table
    await queryInterface.createTable("merchant_deposits", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "merchants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      cashAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      cutcoinAmount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
        defaultValue: "pending",
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    })

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
    ])
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.dropTable("merchant_deposits")
    await queryInterface.dropTable("payments")

    // Remove Paynow configuration from system_configs
    await queryInterface.bulkDelete(
      "system_configs",
      {
        key: {
          [sequelize.Op.in]: [
            "paynow_integration_id",
            "paynow_integration_key",
            "paynow_return_url",
            "paynow_result_url",
            "merchant_daily_deposit_limit",
            "merchant_monthly_deposit_limit",
          ],
        },
      },
      {},
    )
  },
}
