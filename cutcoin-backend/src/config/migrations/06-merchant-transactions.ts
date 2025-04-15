import { type QueryInterface, DataTypes, type Sequelize } from "sequelize"

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
    // Create merchant_transactions table
    await queryInterface.createTable("merchant_transactions", {
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
      type: {
        type: DataTypes.ENUM("deposit", "withdrawal"),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
      },
      fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      reference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "cancelled", "rejected"),
        defaultValue: "pending",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      studentConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      merchantConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      cancelledAt: {
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

    // Add index for faster lookups
    await queryInterface.addIndex("merchant_transactions", ["reference"])
    await queryInterface.addIndex("merchant_transactions", ["userId", "status"])
    await queryInterface.addIndex("merchant_transactions", ["merchantId", "status"])
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.dropTable("merchant_transactions")
  },
}
