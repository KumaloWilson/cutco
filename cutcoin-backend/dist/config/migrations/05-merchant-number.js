"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
exports.default = {
    up: async (queryInterface) => {
        // Add merchantNumber column to merchants table
        await queryInterface.addColumn("merchants", "merchantNumber", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true, // Initially allow null for existing records
            unique: true,
        });
        // Generate merchant numbers for existing merchants
        const merchants = await queryInterface.sequelize.query("SELECT id FROM merchants", {
            type: sequelize_1.QueryTypes.SELECT,
        });
        for (const merchant of merchants) {
            const merchantNumber = `MERCH-${Math.floor(10000 + Math.random() * 90000).toString()}`;
            await queryInterface.sequelize.query(`UPDATE merchants SET "merchantNumber" = ? WHERE id = ?`, {
                replacements: [merchantNumber, merchant.id],
                type: sequelize_1.QueryTypes.UPDATE,
            });
        }
        // Now make the column not nullable
        await queryInterface.changeColumn("merchants", "merchantNumber", {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        });
    },
    down: async (queryInterface, sequelize) => {
        await queryInterface.removeColumn("merchants", "merchantNumber");
    },
};
//# sourceMappingURL=05-merchant-number.js.map