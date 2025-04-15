import { type QueryInterface, DataTypes, type Sequelize, QueryTypes } from "sequelize"

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
      // Add merchantNumber column to merchants table
    await queryInterface.addColumn("merchants", "merchantNumber", {
      type: DataTypes.STRING,
      allowNull: true, // Initially allow null for existing records
      unique: true,
    })

    // Generate merchant numbers for existing merchants
    const merchants = await queryInterface.sequelize.query("SELECT id FROM merchants", {
      type: QueryTypes.SELECT,
    })

    for (const merchant of merchants as any[]) {
      const merchantNumber = `MERCH-${Math.floor(10000 + Math.random() * 90000).toString()}`
      await queryInterface.sequelize.query(`UPDATE merchants SET "merchantNumber" = ? WHERE id = ?`, {
        replacements: [merchantNumber, merchant.id],
        type: QueryTypes.UPDATE,
      })
    }

    // Now make the column not nullable
    await queryInterface.changeColumn("merchants", "merchantNumber", {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    })
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.removeColumn("merchants", "merchantNumber")
  },
}
