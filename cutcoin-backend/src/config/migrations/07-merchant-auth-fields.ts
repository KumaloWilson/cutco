import { type QueryInterface, DataTypes } from "sequelize"

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn("merchants", "email", {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: "placeholder@example.com", // Temporary default for existing records
    })

    await queryInterface.addColumn("merchants", "password", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "placeholder", // Temporary default for existing records
    })

    await queryInterface.addColumn("merchants", "last_login", {
      type: DataTypes.DATE,
      allowNull: true,
    })

    // Make userId nullable for direct merchant registration
    // First, check if the column exists with snake_case naming
    try {
      // Try with snake_case (user_id)
      await queryInterface.changeColumn("merchants", "user_id", {
        type: DataTypes.INTEGER,
        allowNull: true,
      })
    } catch (error) {
      try {
        // Try with camelCase (userId)
        await queryInterface.changeColumn("merchants", "userId", {
          type: DataTypes.INTEGER,
          allowNull: true,
        })
      } catch (innerError) {
        console.error("Could not modify userId/user_id column:", innerError)
        // Continue with migration even if this part fails
      }
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("merchants", "email")
    await queryInterface.removeColumn("merchants", "password")
    await queryInterface.removeColumn("merchants", "last_login")

    // Revert userId to non-nullable - we'll try both naming conventions
    try {
      await queryInterface.changeColumn("merchants", "user_id", {
        type: DataTypes.INTEGER,
        allowNull: false,
      })
    } catch (error) {
      try {
        await queryInterface.changeColumn("merchants", "userId", {
          type: DataTypes.INTEGER,
          allowNull: false,
        })
      } catch (innerError) {
        console.error("Could not revert userId/user_id column:", innerError)
      }
    }
  },
}
