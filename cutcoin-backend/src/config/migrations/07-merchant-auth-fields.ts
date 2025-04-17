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
    await queryInterface.changeColumn("merchants", "user_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
    })
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn("merchants", "email")
    await queryInterface.removeColumn("merchants", "password")
    await queryInterface.removeColumn("merchants", "last_login")

    // Revert userId to non-nullable
    await queryInterface.changeColumn("merchants", "user_id", {
      type: DataTypes.INTEGER,
      allowNull: false,
    })
  },
}
