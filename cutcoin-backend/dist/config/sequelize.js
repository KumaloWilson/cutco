"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const database_1 = __importDefault(require("./database"));
const env = process.env.NODE_ENV || "development";
const sequelize = new sequelize_typescript_1.Sequelize({
    database: database_1.default.development.database,
    username: database_1.default.development.username,
    password: database_1.default.development.password,
    host: database_1.default.development.host,
    port: database_1.default.development.port,
    dialect: database_1.default.development.dialect,
    logging: database_1.default.development.logging,
    pool: database_1.default.development.pool,
    models: [__dirname + "/../models"],
});
exports.default = sequelize;
//# sourceMappingURL=sequelize.js.map