import { type QueryInterface, DataTypes, type Sequelize } from "sequelize"

module.exports = {
  up: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    // Create notifications table
    await queryInterface.createTable("notifications", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

    // Create system_configs table
    await queryInterface.createTable("system_configs", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

    // Create audit_logs table
    await queryInterface.createTable("audit_logs", {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "admins",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entity: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      oldValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      newValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING,
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
    ])
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.dropTable("audit_logs")
    await queryInterface.dropTable("system_configs")
    await queryInterface.dropTable("notifications")
  },
}
