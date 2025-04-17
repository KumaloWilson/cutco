import { type QueryInterface, QueryTypes } from "sequelize"

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
    // Check which column exists
    const columns = await queryInterface.sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'merchants' AND 
       (column_name = 'user_id' OR column_name = 'userId')`,
      { type: QueryTypes.SELECT },
    )

    // Log the found columns for debugging
    console.log("Found columns:", columns)

    if (columns.length === 0) {
      console.log("Neither user_id nor userId column found in merchants table")
      return
    }

    // If we have a userId column but no user_id column, we're good
    // If we have a user_id column but no userId column, we need to rename it
    const hasUserId = columns.some((col: any) => col.column_name === "userId")
    const hasUser_id = columns.some((col: any) => col.column_name === "user_id")

    if (hasUser_id && !hasUserId) {
      // Rename user_id to userId
      await queryInterface.sequelize.query(`ALTER TABLE merchants RENAME COLUMN user_id TO "userId"`)
      console.log("Renamed user_id to userId")
    }

    // Make sure the userId column is nullable
    await queryInterface.sequelize.query(`ALTER TABLE merchants ALTER COLUMN "userId" DROP NOT NULL`)
    console.log("Made userId column nullable")
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    // No need to revert these changes
  },
}
