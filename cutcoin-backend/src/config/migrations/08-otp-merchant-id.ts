import { type QueryInterface, DataTypes } from "sequelize"

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // First, let's check which column exists
    const columns = await queryInterface.describeTable("otps")
    const hasUserIdColumn = "userId" in columns
    const hasUser_IdColumn = "user_id" in columns

    // Add merchantId column to otps table
    await queryInterface.addColumn("otps", "merchant_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "merchants",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    })

    // Add email column to otps table
    await queryInterface.addColumn("otps", "email", {
      type: DataTypes.STRING,
      allowNull: true,
    })

    // Make userId/user_id nullable
    if (hasUserIdColumn) {
      await queryInterface.changeColumn("otps", "userId", {
        type: DataTypes.INTEGER,
        allowNull: true,
      })
    } else if (hasUser_IdColumn) {
      await queryInterface.changeColumn("otps", "user_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
      })
    } else {
      console.log("Neither userId nor user_id column found in otps table. Skipping this step.")
    }

    // Make phoneNumber/phone_number nullable
    const hasPhoneNumberColumn = "phoneNumber" in columns
    const hasPhone_NumberColumn = "phone_number" in columns

    if (hasPhoneNumberColumn) {
      await queryInterface.changeColumn("otps", "phoneNumber", {
        type: DataTypes.STRING,
        allowNull: true,
      })
    } else if (hasPhone_NumberColumn) {
      await queryInterface.changeColumn("otps", "phone_number", {
        type: DataTypes.STRING,
        allowNull: true,
      })
    } else {
      console.log("Neither phoneNumber nor phone_number column found in otps table. Skipping this step.")
    }

    // Add new purpose values
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE enum_otps_purpose ADD VALUE IF NOT EXISTS 'merchant_registration';
        ALTER TYPE enum_otps_purpose ADD VALUE IF NOT EXISTS 'merchant_password_reset';
        ALTER TYPE enum_otps_purpose ADD VALUE IF NOT EXISTS 'withdrawal';
      `)
    } catch (error) {
      console.log("Error adding enum values. This might be expected if they already exist:", error)
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("otps", "merchant_id")
    await queryInterface.removeColumn("otps", "email")

    // Check which column exists
    const columns = await queryInterface.describeTable("otps")
    const hasUserIdColumn = "userId" in columns
    const hasUser_IdColumn = "user_id" in columns

    // Revert userId/user_id to non-nullable
    if (hasUserIdColumn) {
      await queryInterface.changeColumn("otps", "userId", {
        type: DataTypes.INTEGER,
        allowNull: false,
      })
    } else if (hasUser_IdColumn) {
      await queryInterface.changeColumn("otps", "user_id", {
        type: DataTypes.INTEGER,
        allowNull: false,
      })
    }

    // Revert phoneNumber/phone_number to non-nullable
    const hasPhoneNumberColumn = "phoneNumber" in columns
    const hasPhone_NumberColumn = "phone_number" in columns

    if (hasPhoneNumberColumn) {
      await queryInterface.changeColumn("otps", "phoneNumber", {
        type: DataTypes.STRING,
        allowNull: false,
      })
    } else if (hasPhone_NumberColumn) {
      await queryInterface.changeColumn("otps", "phone_number", {
        type: DataTypes.STRING,
        allowNull: false,
      })
    }

    // Note: We can't remove enum values in PostgreSQL
  },
}
