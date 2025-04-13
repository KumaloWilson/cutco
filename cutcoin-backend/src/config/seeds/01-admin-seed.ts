import type { QueryInterface, Sequelize } from "sequelize"
import bcrypt from "bcrypt"


export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    // Create default super admin
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    await queryInterface.bulkInsert("admins", [
      {
        username: "admin",
        password: hashedPassword,
        fullName: "System Administrator",
        email: "admin@cutcoin.ac.zw",
        phoneNumber: "+263771234567",
        role: "super_admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  down: async (queryInterface: QueryInterface, sequelize: Sequelize) => {
    await queryInterface.bulkDelete("admins", { username: "admin" }, {})
  },
}
