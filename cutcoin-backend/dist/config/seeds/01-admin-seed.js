"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.default = {
    up: async (queryInterface) => {
        // Create default super admin
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash("admin123", salt);
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
        ]);
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.bulkDelete("admins", { username: "admin" }, {});
    },
};
//# sourceMappingURL=01-admin-seed.js.map