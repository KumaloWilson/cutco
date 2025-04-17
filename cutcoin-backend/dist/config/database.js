"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    development: {
        username: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "school_erp_dev",
        host: process.env.DB_HOST || "localhost",
        port: Number.parseInt(process.env.DB_PORT || "5432", 10),
        dialect: "postgres",
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    test: {
        username: process.env.TEST_DB_USERNAME || "postgres",
        password: process.env.TEST_DB_PASSWORD || "postgres",
        database: process.env.TEST_DB_NAME || "school_erp_test",
        host: process.env.TEST_DB_HOST || "localhost",
        port: Number.parseInt(process.env.TEST_DB_PORT || "5432", 10),
        dialect: "postgres",
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    },
    production: {
        username: process.env.DB_USERNAME || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "",
        host: process.env.DB_HOST || "",
        port: Number.parseInt(process.env.DB_PORT || "5432", 10),
        dialect: "postgres",
        logging: false,
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000,
        },
    },
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
    bcryptSaltRounds: Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
};
exports.default = config;
//# sourceMappingURL=database.js.map