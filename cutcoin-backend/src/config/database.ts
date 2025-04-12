import type { SequelizeOptions } from "sequelize-typescript"
import dotenv from "dotenv"

dotenv.config()

export const dbConfig: SequelizeOptions = {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "cutcoin",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// For sequelize-cli
module.exports = {
  development: {
    ...dbConfig,
  },
  test: {
    ...dbConfig,
    database: process.env.DB_NAME_TEST || "cutcoin_test",
  },
  production: {
    ...dbConfig,
    logging: false,
  },
}
